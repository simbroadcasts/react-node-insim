import Mitm from 'mitm';
import { InSim } from 'node-insim';

import { createRoot } from '../src';

function stringToBytes(string: string) {
  return string.split('').map((char) => char.charCodeAt(0));
}

describe('InSim connection', () => {
  let mitm: ReturnType<typeof Mitm>;

  beforeEach(() => {
    mitm = Mitm();
  });

  afterEach(() => {
    mitm.disable();
  });

  it('should connect to InSim and send an IS_ISI packet', (done) => {
    const inSim = new InSim();

    mitm.on('connection', (socket, opts) => {
      expect(opts.host).toEqual('127.0.0.1');
      expect(opts.port).toEqual(29999);

      socket.on('data', (data) => {
        expect(data).toEqual(
          Buffer.from([
            11, // Size / 4
            1, // PacketType.ISP_ISI
            255, // ReqI = CONNECT_REQUEST_ID
            0, // Zero
            0, // UDPPort (1)
            0, // UDPPort (2)
            0, // InSimFlags.ISF_CON (1)
            0, // InSimFlags.ISF_CON (2)
            9, // InSimVer
            '!'.charCodeAt(0), // Prefix
            0, // Interval (1)
            0, // Interval (2)
            ...stringToBytes('adminPassword\0\0\0'), // Admin[16]
            ...stringToBytes('Test App\0\0\0\0\0\0\0\0'), // IName[16]
          ]),
        );

        inSim.disconnect();
        done();
      });
    });

    inSim.connect({
      ReqI: 255,
      IName: 'Test App',
      Host: '127.0.0.1',
      Port: 29999,
      Admin: 'adminPassword',
      Prefix: '!',
    });

    createRoot(inSim);
  });
});
