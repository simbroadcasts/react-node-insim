import type Mitm from 'mitm';
import type { Socket } from 'net';
import { InSim } from 'node-insim';
import type { PacketType, SendablePacket } from 'node-insim/packets';
import { IS_VER, Struct } from 'node-insim/packets';

export class PacketInterceptor {
  private socket: Socket;
  private receivedDataBuffer: Uint8Array = new Uint8Array(0);
  private waitingPromises: {
    packetType: PacketType;
    resolve: (packetBuffer: Uint8Array) => void;
    reject: (error: Error) => void;
  }[] = [];

  constructor(socket: Socket) {
    this.socket = socket;
    this.socket.on('data', this.handleData.bind(this));
    this.socket.on('error', (err) => {
      console.error('Socket error in PacketInterceptor:', err);
      this.waitingPromises.forEach((promise) => promise.reject(err));
      this.waitingPromises = [];
    });
    this.socket.on('close', () => {
      this.waitingPromises.forEach((p) =>
        p.reject(new Error('Socket closed unexpectedly')),
      );
      this.waitingPromises = [];
    });
  }

  private handleData(data: Uint8Array) {
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

      if (this.receivedDataBuffer.length >= 1) {
        const packetSizeInMultiples = this.receivedDataBuffer[0];
        const packetSize = packetSizeInMultiples * new Struct().SIZE_MULTIPLIER;

        if (this.receivedDataBuffer.length >= packetSize) {
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
                `[PacketInterceptor] Unexpected packet type (${receivedType.toString()}) at buffer head. Expected ${packetType.toString()}. Waiting for more data or different expectation.`,
              );
              break;
            }
          } catch (error) {
            console.error('[PacketInterceptor] Error unpacking packet:', error);
            break;
          }
        } else {
          break;
        }
      } else {
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

function copyBuffer(buffer: Uint8Array): Uint8Array {
  const dest = new ArrayBuffer(buffer.byteLength);
  const newBuffer = new Uint8Array(dest);
  newBuffer.set(buffer);

  return newBuffer;
}

function stringToBytes(string: string): number[] {
  return string.split('').map((char) => char.charCodeAt(0));
}
