import { IS_BTN } from 'node-insim/packets';
import type { ReactElement } from 'react';
import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Button, createRoot } from '../src';
import {
  beginInSimConnection,
  wait,
  waitForInSimInitPacket,
} from './packetInterceptor';
import { renderInSimButtons } from './renderInSimButtons';

describe('Button validation', () => {
  let consoleErrorSpy: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  function expectRenderErrorMessage(message: string) {
    expect(consoleErrorSpy).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ message }),
    );
  }

  it('should not send a button when width is set without height', async () => {
    const { packetInterceptor, cleanup } = await renderInSimButtons(
      <Button width={20} height={0}>
        Hello world
      </Button>,
    );

    await packetInterceptor.assertNoMoreData();
    expectRenderErrorMessage('Invalid button dimensions: W=20 H=0');

    cleanup();
  });

  it('should not send a button when height is set without width', async () => {
    const { packetInterceptor, cleanup } = await renderInSimButtons(
      <Button width={0} height={5}>
        Hello world
      </Button>,
    );

    await packetInterceptor.assertNoMoreData();
    expectRenderErrorMessage('Invalid button dimensions: W=0 H=5');

    cleanup();
  });

  it('should not send a button when no dimensions are set', async () => {
    const { packetInterceptor, cleanup } = await renderInSimButtons(
      <Button>Hello world</Button>,
    );

    await packetInterceptor.assertNoMoreData();
    expectRenderErrorMessage('Invalid button dimensions: W=0 H=0');

    cleanup();
  });

  it('should not send a button when button text is too long', async () => {
    const { packetInterceptor, cleanup } = await renderInSimButtons(
      <Button width={20} height={5}>
        {'a'.repeat(241)}
      </Button>,
    );

    await packetInterceptor.assertNoMoreData();
    expectRenderErrorMessage('Button text too long');

    cleanup();
  });

  it('should send a button when text is at the maximum length', async () => {
    const maxLengthText = 'a'.repeat(240);

    const { packetInterceptor, cleanup } = await renderInSimButtons(
      <Button width={20} height={5}>
        {maxLengthText}
      </Button>,
    );

    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        W: 20,
        H: 5,
        Text: maxLengthText,
      }),
    );
    await packetInterceptor.assertNoMoreData();
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    cleanup();
  });

  // React's scheduler dispatches concurrent work via MessageChannel, which
  // can need more than one macrotask turn to fully commit under a loaded
  // machine (e.g. CI). A single `wait(0)` isn't always enough headroom, and
  // if it isn't, renders queue up and get batched together instead of one
  // per iteration, which is what this test relies on.
  async function settle() {
    for (let i = 0; i < 5; i++) {
      await wait(0);
    }
  }

  it('should not send a button when too many buttons are rendered for the same UCID', async () => {
    // Deliberately left unconnected (no version handshake): ClickID
    // allocation happens in commitMount regardless of connection state, and
    // skipping the handshake means no IS_BTN packets need to be drained here.
    const { inSim, waitForTCPConnection, cleanup } = beginInSimConnection();
    const root = createRoot(inSim);
    await waitForInSimInitPacket(waitForTCPConnection);

    const buttons: ReactElement[] = [];

    for (let clickId = 0; clickId <= IS_BTN.MAX_CLICK_ID; clickId++) {
      buttons.push(
        <Button key={clickId} UCID={1} width={20} height={5}>
          {`Button ${clickId}`}
        </Button>,
      );
      root.render(<>{buttons}</>);

      // Let this render's commitMount (and ClickID allocation) finish before
      // the next one is constructed.
      await settle();
    }

    buttons.push(
      <Button key="overflow" UCID={1} width={20} height={5}>
        Overflow
      </Button>,
    );
    root.render(<>{buttons}</>);
    await settle();

    expectRenderErrorMessage(
      `Too many buttons for UCID 1. The maximum number of rendered buttons is ${IS_BTN.MAX_CLICK_ID}.`,
    );

    cleanup();
  });
});
