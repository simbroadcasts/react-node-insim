import Mitm from 'mitm';
import type { Socket } from 'net';
import { InSim } from 'node-insim';
import type {
  PacketType,
  SendablePacket as SendablePacketInstance,
  Struct as StructInstance,
} from 'node-insim/packets';
import {
  IS_BTC,
  IS_BTT,
  IS_ISI,
  IS_NCN,
  IS_NPL,
  IS_VER,
  SendablePacket,
  Struct,
} from 'node-insim/packets';
import { expect } from 'vitest';

function copyBuffer(buffer: Uint8Array): Uint8Array {
  const dest = new ArrayBuffer(buffer.byteLength);
  const newBuffer = new Uint8Array(dest);
  newBuffer.set(buffer);
  return newBuffer;
}

export class PacketInterceptor {
  private socket: Socket;
  private receivedDataBuffer: Uint8Array = new Uint8Array(0);
  private waitingPromises: {
    packetType: PacketType;
    resolve: (packetBuffer: Uint8Array) => void;
    reject: (error: Error) => void;
  }[] = [];
  private noMoreDataPromise: {
    resolve: () => void;
    reject: (error: Error) => void;
    timeoutId: NodeJS.Timeout | null;
  } | null = null;

  constructor(socket: Socket) {
    this.socket = socket;

    this.socket.on('data', this.handleData.bind(this));

    this.socket.on('error', (err) => {
      console.error('Socket error in PacketInterceptor:', err);
      this.waitingPromises.forEach((promise) => promise.reject(err));
      this.waitingPromises = [];

      if (this.noMoreDataPromise) {
        this.noMoreDataPromise.reject(err);
        this.noMoreDataPromise = null;
      }
    });

    this.socket.on('close', () => {
      this.waitingPromises.forEach((p) =>
        p.reject(new Error('Socket closed unexpectedly')),
      );
      this.waitingPromises = [];

      if (this.noMoreDataPromise) {
        this.noMoreDataPromise.reject(
          new Error('Socket closed unexpectedly during noMoreData check'),
        );
        this.noMoreDataPromise = null;
      }
    });
  }

  private handleData(data: Uint8Array) {
    if (this.noMoreDataPromise) {
      if (this.noMoreDataPromise.timeoutId) {
        clearTimeout(this.noMoreDataPromise.timeoutId);
      }
      this.noMoreDataPromise.reject(
        new Error(
          `[PacketInterceptor] Unexpected data received during 'noMoreData' assertion. Data length: ${data.length}`,
        ),
      );
      this.noMoreDataPromise = null;
    }

    this.receivedDataBuffer = new Uint8Array([
      ...this.receivedDataBuffer,
      ...data,
    ]);
    this.processBuffer();
  }

  private processBuffer() {
    while (this.waitingPromises.length > 0) {
      const { resolve, packetType } = this.waitingPromises[0];

      if (this.receivedDataBuffer.length < 1) {
        break;
      }

      const packetSizeInMultiples = this.receivedDataBuffer[0];
      const packetSize = packetSizeInMultiples * new Struct().SIZE_MULTIPLIER;

      if (this.receivedDataBuffer.length < packetSize) {
        break;
      }

      const packetBuffer = this.receivedDataBuffer.subarray(0, packetSize);
      const [, receivedType] = packetBuffer;

      try {
        if (receivedType === packetType) {
          this.receivedDataBuffer = copyBuffer(
            this.receivedDataBuffer.subarray(packetSize),
          );
          this.waitingPromises.shift();
          resolve(packetBuffer);
        } else {
          console.warn(
            `[PacketInterceptor] Unexpected packet type (0x${receivedType.toString(
              16,
            )}) at buffer head. Expected 0x${packetType.toString(
              16,
            )}. Buffer length: ${
              this.receivedDataBuffer.length
            }. Waiting for more data or different expectation.`,
          );
          break;
        }
      } catch (error) {
        console.error('[PacketInterceptor] Error processing packet:', error);
        break;
      }
    }
  }

  public async waitForPacket<T extends SendablePacketInstance>(
    expectedPacket: T,
  ) {
    const promise = new Promise<Uint8Array>((resolve, reject) => {
      this.waitingPromises.push({
        resolve,
        reject,
        packetType: expectedPacket.Type,
      });
      this.processBuffer();
    });

    const packetBuffer = await promise;

    expect(packetBuffer).toEqual(expectedPacket.pack());
  }

  public async assertNoMoreData(timeoutMs = 50): Promise<void> {
    if (this.waitingPromises.length > 0) {
      throw new Error(
        '[PacketInterceptor] Cannot assert no more data while there are pending packet expectations.',
      );
    }
    if (this.receivedDataBuffer.length > 0) {
      throw new Error(
        `[PacketInterceptor] Remaining unprocessed data in buffer (${
          this.receivedDataBuffer.length
        } bytes) when asserting no more data. Buffer: [${this.receivedDataBuffer.join(
          ',',
        )}] | '${new TextDecoder().decode(this.receivedDataBuffer)}'`,
      );
    }

    return new Promise((resolve, reject) => {
      this.noMoreDataPromise = {
        resolve,
        reject,
        timeoutId: setTimeout(() => {
          this.noMoreDataPromise = null;
          resolve();
        }, timeoutMs),
      };
    });
  }
}

export async function getTCPConnectionPromise(
  mitm: Mitm.Mitm,
  host: string,
  port: number,
) {
  const socket = await new Promise<Socket>((resolve) => {
    mitm.on('connection', (socket, opts) => {
      expect(opts.host).toEqual(host);
      expect(opts.port).toEqual(port);
      resolve(socket);
    });
  });

  const packetInterceptor = new PacketInterceptor(socket);

  return {
    socket,
    packetInterceptor,
  };
}

const INSIM_HOST = '127.0.0.1';
const INSIM_PORT = 29999;
const INSIM_REQI = 255;

export function beginInSimConnection() {
  const mitm = Mitm();
  const inSim = new InSim();
  const waitForTCPConnection = getTCPConnectionPromise(
    mitm,
    INSIM_HOST,
    INSIM_PORT,
  );

  inSim.connect({
    ReqI: INSIM_REQI,
    Host: INSIM_HOST,
    Port: INSIM_PORT,
  });

  return {
    mitm,
    inSim,
    waitForTCPConnection,
    cleanup: () => {
      mitm.disable();
      inSim.disconnect();
    },
  };
}

export async function waitForInSimInitPacket(
  waitForTCPConnection: ReturnType<typeof getTCPConnectionPromise>,
) {
  const { socket, packetInterceptor } = await waitForTCPConnection;

  await packetInterceptor.waitForPacket(
    new IS_ISI({
      ReqI: INSIM_REQI,
      InSimVer: 10,
    }),
  );

  return { socket, packetInterceptor };
}

export async function completeHandshake(
  socket: Socket,
  waitMs = 10,
): Promise<void> {
  await wait(waitMs);
  await sendVersionPacket({ socket, ReqI: INSIM_REQI });
}

export async function connectAndCompleteHandshake(
  waitForTCPConnection: ReturnType<typeof getTCPConnectionPromise>,
  waitMs = 10,
) {
  const { socket, packetInterceptor } =
    await waitForInSimInitPacket(waitForTCPConnection);
  await completeHandshake(socket, waitMs);

  return { socket, packetInterceptor };
}

export async function sendVersionPacket({
  socket,
  ReqI,
}: {
  socket: Socket;
  ReqI: number;
}): Promise<void> {
  const ver = new IS_VER();
  ver.ReqI = ReqI;
  ver.Version = '0.7F';
  ver.Product = 'S3';
  ver.InSimVer = InSim.INSIM_VERSION;

  return sendPacket(socket, ver);
}

function writeToSocket(socket: Socket, buffer: Buffer): Promise<void> {
  return new Promise((resolve, reject) => {
    socket.write(buffer, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Receive-only packets (e.g. IS_NCN, IS_BTC) don't implement `pack()` -
// there's normally no reason for InSim to send one. `pack()` is only
// defined on SendablePacket, but its implementation is generic (driven by
// each packet's own field decorators), so it works identically when called
// against any Struct instance - this lets tests simulate LFS sending these
// packets without hand-building their wire format.
export async function sendPacket(
  socket: Socket,
  packet: StructInstance,
): Promise<void> {
  const buffer = SendablePacket.prototype.pack.call(packet);
  return writeToSocket(socket, Buffer.from(buffer));
}

export async function sendButtonClickPacket(
  socket: Socket,
  { ReqI, UCID = 0, ClickID }: { ReqI: number; UCID?: number; ClickID: number },
): Promise<void> {
  const packet = new IS_BTC();
  packet.ReqI = ReqI;
  packet.UCID = UCID;
  packet.ClickID = ClickID;

  return sendPacket(socket, packet);
}

export async function sendButtonTypePacket(
  socket: Socket,
  {
    ReqI,
    UCID = 0,
    ClickID,
    TypeIn,
    Text,
  }: {
    ReqI: number;
    UCID?: number;
    ClickID: number;
    TypeIn: number;
    Text: string;
  },
): Promise<void> {
  const packet = new IS_BTT();
  packet.ReqI = ReqI;
  packet.UCID = UCID;
  packet.ClickID = ClickID;
  packet.TypeIn = TypeIn;
  packet.Text = Text;

  return sendPacket(socket, packet);
}

export async function sendNewConnectionPacket(
  socket: Socket,
  {
    UCID,
  }: {
    UCID: number;
  },
): Promise<void> {
  const packet = new IS_NCN();
  packet.UCID = UCID;

  return sendPacket(socket, packet);
}

export async function sendNewPlayerPacket(
  socket: Socket,
  {
    UCID,
    PLID,
    PType = 0,
  }: {
    UCID: number;
    PLID: number;
    PType?: number;
  },
): Promise<void> {
  const packet = new IS_NPL();
  packet.UCID = UCID;
  packet.PLID = PLID;
  packet.PType = PType;

  return sendPacket(socket, packet);
}

export async function wait(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
