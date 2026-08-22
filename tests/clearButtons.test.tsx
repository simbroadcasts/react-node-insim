import { ButtonFunction, IS_BFN, IS_BTN } from 'node-insim/packets';
import { describe, it } from 'vitest';

import { Button, createRoot } from '../src';
import {
  beginInSimConnection,
  connectAndCompleteHandshake,
  sendPacket,
  wait,
} from './packetInterceptor';

describe('Clearing and restoring all buttons (Shift+I)', () => {
  it('should stop sending button updates while cleared, and resend when requested', async () => {
    const { inSim, waitForTCPConnection, cleanup } = beginInSimConnection();

    const root = createRoot(inSim);
    root.render(
      <Button width={20} height={5}>
        Hello world
      </Button>,
    );

    const { packetInterceptor, socket } =
      await connectAndCompleteHandshake(waitForTCPConnection);

    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        W: 20,
        H: 5,
        Text: 'Hello world',
      }),
    );

    // User pressed Shift+I to clear all buttons - no further button updates
    // should be sent while they're hidden.
    await sendPacket(
      socket,
      new IS_BFN({ SubT: ButtonFunction.BFN_USER_CLEAR }),
    );
    await wait(20);
    await packetInterceptor.assertNoMoreData();

    // User pressed Shift+I again to bring the buttons back.
    await sendPacket(socket, new IS_BFN({ SubT: ButtonFunction.BFN_REQUEST }));

    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        W: 20,
        H: 5,
        Text: 'Hello world',
      }),
    );
    await packetInterceptor.assertNoMoreData();

    cleanup();
  });
});
