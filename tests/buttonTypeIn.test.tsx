import Mitm from 'mitm';
import { InSim } from 'node-insim';
import { ButtonStyle, IS_BTN, IS_ISI, TypeIn } from 'node-insim/packets';
import { describe, it } from 'vitest';

import { Button, createRoot } from '../src';
import {
  getTCPConnectionPromise,
  sendVersionPacket,
  wait,
} from './packetInterceptor';

describe('Button type in', () => {
  it('should set TypeIn to maxTypeInChars when onType is provided', async () => {
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
      <Button width={20} height={5} onType={() => {}} maxTypeInChars={42}>
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
        TypeIn: 42,
        BStyle: ButtonStyle.ISB_CLICK,
      }),
    );
    await packetInterceptor.assertNoMoreData();

    mitm.disable();
    inSim.disconnect();
  });

  it('should not set TypeIn when onType is not provided, even if maxTypeInChars is set', async () => {
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
      <Button width={20} height={5} maxTypeInChars={42}>
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
        TypeIn: 0,
      }),
    );
    await packetInterceptor.assertNoMoreData();

    mitm.disable();
    inSim.disconnect();
  });

  it('should add INIT_VALUE_BUTTON_TEXT to TypeIn when initializeDialogWithButtonText is set', async () => {
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
      <Button
        width={20}
        height={5}
        onType={() => {}}
        maxTypeInChars={42}
        initializeDialogWithButtonText
      >
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
        TypeIn: 42 + TypeIn.INIT_VALUE_BUTTON_TEXT,
        BStyle: ButtonStyle.ISB_CLICK,
      }),
    );
    await packetInterceptor.assertNoMoreData();

    mitm.disable();
    inSim.disconnect();
  });
});
