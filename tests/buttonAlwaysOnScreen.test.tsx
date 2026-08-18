import Mitm from 'mitm';
import { InSim } from 'node-insim';
import { IS_BTN, IS_ISI } from 'node-insim/packets';
import { describe, it } from 'vitest';

import { Button, createRoot } from '../src';
import {
  getTCPConnectionPromise,
  sendVersionPacket,
  wait,
} from './packetInterceptor';

describe('Button always on screen', () => {
  it('should set Inst to INST_ALWAYS_ON when isAlwaysOnScreen is set', async () => {
    const mitm = Mitm();
    const inSim = new InSim();
    const waitForTCPConnection = getTCPConnectionPromise(
      mitm,
      '127.0.0.1',
      29999,
    );

    inSim.connect({
      ReqI: 255,
      Host: '127.0.0.1',
      Port: 29999,
    });

    const root = createRoot(inSim);
    root.render(
      <Button width={20} height={5} isAlwaysOnScreen>
        Hello
      </Button>,
    );

    const { packetInterceptor, socket } = await waitForTCPConnection;

    await packetInterceptor.waitForPacket(
      new IS_ISI({
        ReqI: 255,
        InSimVer: 10,
      }),
    );

    await wait(10);
    await sendVersionPacket({ socket, ReqI: 255 });



    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        W: 20,
        H: 5,
        Text: 'Hello',
        Inst: IS_BTN.INST_ALWAYS_ON,
      }),
    );
    await packetInterceptor.assertNoMoreData();

    mitm.disable();
    inSim.disconnect();
  });

  it('should not set Inst when isAlwaysOnScreen is not set', async () => {
    const mitm = Mitm();
    const inSim = new InSim();
    const waitForTCPConnection = getTCPConnectionPromise(
      mitm,
      '127.0.0.1',
      29999,
    );

    inSim.connect({
      ReqI: 255,
      Host: '127.0.0.1',
      Port: 29999,
    });

    const root = createRoot(inSim);
    root.render(
      <Button width={20} height={5}>
        Hello
      </Button>,
    );

    const { packetInterceptor, socket } = await waitForTCPConnection;

    await packetInterceptor.waitForPacket(
      new IS_ISI({
        ReqI: 255,
        InSimVer: 10,
      }),
    );

    await wait(10);
    await sendVersionPacket({ socket, ReqI: 255 });

    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        W: 20,
        H: 5,
        Text: 'Hello',
        Inst: 0,
      }),
    );
    await packetInterceptor.assertNoMoreData();

    mitm.disable();
    inSim.disconnect();
  });
});
