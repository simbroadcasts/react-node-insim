import Mitm from 'mitm';
import { InSim } from 'node-insim';
import { IS_BTN, IS_ISI, IS_VER } from 'node-insim/packets';

import type { CreateRootOptions } from '../src';
import { Button, createRoot } from '../src';

function stringToBytes(string: string) {
  return string.split('').map((char) => char.charCodeAt(0));
}

describe('Buttons', () => {
  let mitm: ReturnType<typeof Mitm>;

  beforeEach(() => {
    mitm = Mitm();
  });

  afterEach(() => {
    mitm.disable();
  });

  it('should connect to InSim and send a button', (done) => {
    const createRootOptions: CreateRootOptions = {
      name: 'Test App',
      host: '127.0.0.1',
      port: 29999,
      adminPassword: 'adminPassword',
      prefix: '!',
    };

    let root: ReturnType<typeof createRoot>;

    process.nextTick(() => {
      root = createRoot(createRootOptions);
      root.render(
        <Button width={20} height={5}>
          Hello world
        </Button>,
      );
    });

    mitm.on('connection', (socket, opts) => {
      expect(opts.host).toEqual('127.0.0.1');
      expect(opts.port).toEqual(29999);

      let receivedPackets: Buffer[] = [];

      socket.on('data', (data) => {
        receivedPackets.push(data);
        const combined = Buffer.concat(receivedPackets);
        const isi = new IS_ISI({
          ReqI: 255,
          InSimVer: 9,
          Prefix: '!',
          IName: 'Test App',
          Admin: 'adminPassword',
        });

        if (combined.length >= isi.Size && receivedPackets.length === 1) {
          expect(combined).toEqual(Buffer.from(isi.pack()));

          const ver = new IS_VER();
          const versionPacket = Buffer.from([
            ver.Size / ver.SIZE_MULTIPLIER,
            ver.Type,
            255, // ReqI
            0, // Zero
            ...stringToBytes('0.7F\0\0\0\0'), // Version
            ...stringToBytes('S3\0\0\0\0'), // Product
            InSim.INSIM_VERSION,
            0, // Spare
          ]);
          setTimeout(() => socket.write(versionPacket));

          receivedPackets = [];
          return;
        }

        const btn = new IS_BTN({
          ReqI: 1,
          W: 20,
          H: 5,
          L: 0,
          T: 0,
          ClickID: 0,
          Text: 'Hello world',
        });

        if (combined.length >= btn.Size) {
          expect(combined).toEqual(Buffer.from(btn.pack()));

          root.disconnect();
          done();
        }
      });
    });
  });
});
