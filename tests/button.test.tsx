import Mitm from 'mitm';
import { InSim } from 'node-insim';
import { IS_BTN, IS_ISI } from 'node-insim/packets';

import { Button, createRoot } from '../src';
import {
  getTCPConnectionPromise,
  sendVersionPacket,
  wait,
} from './packetInterceptor';

describe('Buttons', () => {
  let mitm: ReturnType<typeof Mitm>;
  let inSim: InSim;
  let waitForTCPConnection: ReturnType<typeof getTCPConnectionPromise>;

  beforeEach(() => {
    mitm = Mitm();
    inSim = new InSim();
    waitForTCPConnection = getTCPConnectionPromise(mitm, '127.0.0.1', 29999);

    inSim.connect({
      ReqI: 255,
      Host: '127.0.0.1',
      Port: 29999,
    });
  });

  afterEach(() => {
    mitm.disable();
    inSim.disconnect();
  });

  it('should connect to InSim and send a button', async () => {
    const root = createRoot(inSim);
    root.render(
      <Button width={20} height={5}>
        Hello world
      </Button>,
    );

    const { packetInterceptor, socket } = await waitForTCPConnection;

    await packetInterceptor.waitForPacket(
      new IS_ISI({
        ReqI: 255,
        InSimVer: 9,
      }),
    );

    await wait(10);
    await sendVersionPacket(socket, 255);

    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ReqI: 1,
        W: 20,
        H: 5,
        Text: 'Hello world',
      }),
    );
  });
});
