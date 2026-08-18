import Mitm from 'mitm';
import { InSim } from 'node-insim';
import { ButtonFunction, IS_BFN, IS_BTN, IS_ISI } from 'node-insim/packets';
import { afterEach, beforeEach, describe, it } from 'vitest';

import { Button, createRoot } from '../src';
import {
  getTCPConnectionPromise,
  sendVersionPacket,
  wait,
} from './packetInterceptor';

describe('Button updates', () => {
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

  it('should send an updated button when only its text changes', async () => {
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
        Text: 'Hello world',
      }),
    );

    root.render(
      <Button width={20} height={5}>
        Updated text
      </Button>,
    );

    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        W: 0,
        H: 0,
        Text: 'Updated text',
      }),
    );
    await packetInterceptor.assertNoMoreData();
  });

  it('should send a full button update when its dimensions change', async () => {
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
        Text: 'Hello world',
      }),
    );

    root.render(
      <Button top={20} left={50} width={40} height={10}>
        Hello world
      </Button>,
    );

    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        T: 20,
        L: 50,
        W: 40,
        H: 10,
        Text: 'Hello world',
      }),
    );
    await packetInterceptor.assertNoMoreData();
  });

  it('should delete a button when it is unmounted, freeing its ClickID', async () => {
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
        Text: 'Hello world',
      }),
    );

    root.render(null);

    await packetInterceptor.waitForPacket(
      new IS_BFN({
        SubT: ButtonFunction.BFN_DEL_BTN,
        ClickID: 0,
        UCID: 0,
      }),
    );
    await packetInterceptor.assertNoMoreData();

    root.render(
      <Button width={30} height={8}>
        New button
      </Button>,
    );

    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        W: 30,
        H: 8,
        Text: 'New button',
      }),
    );
    await packetInterceptor.assertNoMoreData();
  });
});
