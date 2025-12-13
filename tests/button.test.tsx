import Mitm from 'mitm';
import { InSim } from 'node-insim';
import { IS_BTN, IS_ISI } from 'node-insim/packets';
import { afterEach, beforeEach, describe, it } from 'vitest';

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

  it('should send a button', async () => {
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
    await sendVersionPacket(socket, 255);

    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        W: 20,
        H: 5,
        Text: 'Hello world',
      }),
    );
  });

  it('should send multiple buttons with incremental unique ClickIDs', async () => {
    const root = createRoot(inSim);
    root.render(
      <>
        <Button width={20} height={5}>
          One
        </Button>
        <Button top={20} left={50} width={40} height={10}>
          Two
        </Button>
        <Button top={30} left={60} width={10} height={5}>
          Three
        </Button>
      </>,
    );

    const { packetInterceptor, socket } = await waitForTCPConnection;

    await packetInterceptor.waitForPacket(
      new IS_ISI({
        ReqI: 255,
        InSimVer: 10,
      }),
    );

    await wait(50);
    await sendVersionPacket(socket, 255);

    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        W: 20,
        H: 5,
        Text: 'One',
      }),
    );
    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 1,
        ReqI: 1,
        T: 20,
        L: 50,
        W: 40,
        H: 10,
        Text: 'Two',
      }),
    );
    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 2,
        ReqI: 1,
        T: 30,
        L: 60,
        W: 10,
        H: 5,
        Text: 'Three',
      }),
    );
    await packetInterceptor.assertNoMoreData();
  });
});
