import type Mitm from 'mitm';
import type { Socket } from 'net';
import { InSim } from 'node-insim';
import type { PacketType, SendablePacket } from 'node-insim/packets';
import { IS_VER, Struct } from 'node-insim/packets';
import { expect } from 'vitest';

function copyBuffer(buffer: Uint8Array): Uint8Array {
  const dest = new ArrayBuffer(buffer.byteLength);
  const newBuffer = new Uint8Array(dest);
  newBuffer.set(buffer);
  return newBuffer;
}

function stringToBytes(string: string): number[] {
  return string.split('').map((char) => char.charCodeAt(0));
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
    let processedAny = true;

    while (processedAny && this.waitingPromises.length > 0) {
      processedAny = false;

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
          processedAny = true;
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

  public async waitForPacket<T extends SendablePacket>(expectedPacket: T) {
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

export async function sendVersionPacket(
  socket: Socket,
  reqI: number,
): Promise<void> {
  const ver = new IS_VER();
  const versionPacketBuffer = Buffer.from([
    ver.Size / ver.SIZE_MULTIPLIER,
    ver.Type,
    reqI,
    0, // Zero
    ...stringToBytes('0.7F\0\0\0\0'), // Version
    ...stringToBytes('S3\0\0\0\0'), // Product
    InSim.INSIM_VERSION, // InSim version from node-insim
    0, // Spare
  ]);

  return new Promise((resolve, reject) => {
    socket.write(versionPacketBuffer, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export async function wait(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
