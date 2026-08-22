import { ButtonFunction, IS_BTN } from 'node-insim/packets';
import { describe, it } from 'vitest';

import { Button } from '../src';
import {
  sendClearButtonsPacket,
  sendConnectionLeavePacket,
  sendNewConnectionPacket,
  wait,
} from './packetInterceptor';
import { renderInSimButtons } from './renderInSimButtons';

describe('Clearing and restoring all buttons (Shift+I)', () => {
  it('should stop sending button updates while cleared, and resend when requested', async () => {
    const { packetInterceptor, socket, cleanup } = await renderInSimButtons(
      <Button width={20} height={5}>
        Hello world
      </Button>,
    );

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
    await sendClearButtonsPacket(socket, {
      SubT: ButtonFunction.BFN_USER_CLEAR,
    });
    await wait(20);
    await packetInterceptor.assertNoMoreData();

    // User pressed Shift+I again to bring the buttons back.
    await sendClearButtonsPacket(socket, { SubT: ButtonFunction.BFN_REQUEST });

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

  it('should isolate clearing/restoring to the connection that requested it', async () => {
    const { root, packetInterceptor, socket, cleanup } =
      await renderInSimButtons(
        <>
          <Button UCID={1} width={20} height={5}>
            A
          </Button>
          <Button UCID={2} width={20} height={5}>
            B
          </Button>
        </>,
      );

    await packetInterceptor.waitForPacket(
      new IS_BTN({ ClickID: 0, ReqI: 1, UCID: 1, W: 20, H: 5, Text: 'A' }),
    );
    await packetInterceptor.waitForPacket(
      new IS_BTN({ ClickID: 0, ReqI: 1, UCID: 2, W: 20, H: 5, Text: 'B' }),
    );

    // UCID 1 hides their buttons - this must not affect UCID 2 at all.
    await sendClearButtonsPacket(socket, {
      SubT: ButtonFunction.BFN_USER_CLEAR,
      UCID: 1,
    });
    await wait(20);
    await packetInterceptor.assertNoMoreData();

    root.render(
      <>
        <Button UCID={1} width={20} height={5}>
          A2
        </Button>
        <Button UCID={2} width={20} height={5}>
          B2
        </Button>
      </>,
    );

    // Only UCID 2's update is sent - UCID 1's is suppressed while cleared.
    await packetInterceptor.waitForPacket(
      new IS_BTN({ ClickID: 0, ReqI: 1, UCID: 2, W: 0, H: 0, Text: 'B2' }),
    );
    await wait(20);
    await packetInterceptor.assertNoMoreData();

    // UCID 1 requests their buttons back - they receive the latest content.
    await sendClearButtonsPacket(socket, {
      SubT: ButtonFunction.BFN_REQUEST,
      UCID: 1,
    });

    await packetInterceptor.waitForPacket(
      new IS_BTN({ ClickID: 0, ReqI: 1, UCID: 1, W: 20, H: 5, Text: 'A2' }),
    );
    await packetInterceptor.assertNoMoreData();

    cleanup();
  });

  it('should split a UCID=255 button into individual packets once a connected UCID has cleared', async () => {
    const { packetInterceptor, socket, cleanup } = await renderInSimButtons(
      <Button UCID={255} width={20} height={5}>
        Hello world
      </Button>,
    );

    // Initial send: nobody connected has cleared anything, so a single
    // broadcast packet is sent (byte-identical to today's behavior).
    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        UCID: 255,
        W: 20,
        H: 5,
        Text: 'Hello world',
      }),
    );

    // Each new connection joining re-sends the global button (so it's also
    // shown to them) - still the fast broadcast path, since nothing is
    // cleared yet.
    await sendNewConnectionPacket(socket, { UCID: 1 });
    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        UCID: 255,
        W: 20,
        H: 5,
        Text: 'Hello world',
      }),
    );

    await sendNewConnectionPacket(socket, { UCID: 2 });
    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        UCID: 255,
        W: 20,
        H: 5,
        Text: 'Hello world',
      }),
    );

    // UCID 1 hides their buttons - the global button must keep updating for
    // every other connected UCID, but not for UCID 1.
    await sendClearButtonsPacket(socket, {
      SubT: ButtonFunction.BFN_USER_CLEAR,
      UCID: 1,
    });

    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        UCID: 0,
        W: 20,
        H: 5,
        Text: 'Hello world',
      }),
    );
    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        UCID: 2,
        W: 20,
        H: 5,
        Text: 'Hello world',
      }),
    );
    await wait(20);
    await packetInterceptor.assertNoMoreData();

    // UCID 1 requests their buttons back - a single broadcast resumes.
    await sendClearButtonsPacket(socket, {
      SubT: ButtonFunction.BFN_REQUEST,
      UCID: 1,
    });

    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        UCID: 255,
        W: 20,
        H: 5,
        Text: 'Hello world',
      }),
    );
    await packetInterceptor.assertNoMoreData();

    cleanup();
  });

  it('should not leave a UCID stuck as cleared after it disconnects', async () => {
    const { root, packetInterceptor, socket, cleanup } =
      await renderInSimButtons(
        <Button UCID={1} width={20} height={5}>
          Hello
        </Button>,
      );

    await packetInterceptor.waitForPacket(
      new IS_BTN({ ClickID: 0, ReqI: 1, UCID: 1, W: 20, H: 5, Text: 'Hello' }),
    );

    // UCID 1 hides their buttons, then a text update is suppressed while
    // hidden.
    await sendClearButtonsPacket(socket, {
      SubT: ButtonFunction.BFN_USER_CLEAR,
      UCID: 1,
    });

    root.render(
      <Button UCID={1} width={20} height={5}>
        Updated
      </Button>,
    );
    await wait(20);
    await packetInterceptor.assertNoMoreData();

    // UCID 1 disconnects while still cleared - this must not leave them
    // stuck as cleared forever (e.g. if the number gets reused later).
    await sendConnectionLeavePacket(socket, { UCID: 1 });

    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        UCID: 1,
        W: 20,
        H: 5,
        Text: 'Updated',
      }),
    );
    await packetInterceptor.assertNoMoreData();

    cleanup();
  });
});
