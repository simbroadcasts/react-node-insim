import Mitm from 'mitm';
import { InSim } from 'node-insim';
import { IS_BTN, IS_ISI } from 'node-insim/packets';
import type { ReactElement } from 'react';
import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Button, createRoot } from '../src';
import {
  getTCPConnectionPromise,
  sendVersionPacket,
  wait,
} from './packetInterceptor';

describe('Button validation', () => {
  let mitm: ReturnType<typeof Mitm>;
  let inSim: InSim;
  let waitForTCPConnection: ReturnType<typeof getTCPConnectionPromise>;
  let consoleErrorSpy: MockInstance<typeof console.error>;

  beforeEach(() => {
    mitm = Mitm();
    inSim = new InSim();
    waitForTCPConnection = getTCPConnectionPromise(mitm, '127.0.0.1', 29999);
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    inSim.connect({
      ReqI: 255,
      Host: '127.0.0.1',
      Port: 29999,
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    mitm.disable();
    inSim.disconnect();
  });

  // Rendering before the version handshake mirrors how a real app mounts its
  // tree: InSimContextProvider must exist to catch the IS_VER packet, so it
  // has to be rendered before the packet arrives, not after.
  async function connectAndWaitForISI() {
    const root = createRoot(inSim);
    const { packetInterceptor, socket } = await waitForTCPConnection;

    await packetInterceptor.waitForPacket(
      new IS_ISI({
        ReqI: 255,
        InSimVer: 10,
      }),
    );

    return { root, packetInterceptor, socket };
  }

  async function completeHandshake(
    socket: Awaited<ReturnType<typeof connectAndWaitForISI>>['socket'],
  ) {
    await wait(10);
    await sendVersionPacket({ socket, ReqI: 255 });
  }

  function expectRenderErrorMessage(message: string) {
    expect(consoleErrorSpy).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ message }),
    );
  }

  it('should not send a button when width is set without height', async () => {
    const { root, packetInterceptor, socket } = await connectAndWaitForISI();

    root.render(
      <Button width={20} height={0}>
        Hello world
      </Button>,
    );
    await completeHandshake(socket);

    await packetInterceptor.assertNoMoreData();
    expectRenderErrorMessage('Invalid button dimensions: W=20 H=0');
  });

  it('should not send a button when height is set without width', async () => {
    const { root, packetInterceptor, socket } = await connectAndWaitForISI();

    root.render(
      <Button width={0} height={5}>
        Hello world
      </Button>,
    );
    await completeHandshake(socket);

    await packetInterceptor.assertNoMoreData();
    expectRenderErrorMessage('Invalid button dimensions: W=0 H=5');
  });

  it('should not send a button when no dimensions are set', async () => {
    const { root, packetInterceptor, socket } = await connectAndWaitForISI();

    root.render(<Button>Hello world</Button>);
    await completeHandshake(socket);

    await packetInterceptor.assertNoMoreData();
    expectRenderErrorMessage('Invalid button dimensions: W=0 H=0');
  });

  it('should not send a button when button text is too long', async () => {
    const { root, packetInterceptor, socket } = await connectAndWaitForISI();
    root.render(
      <Button width={20} height={5}>
        {'a'.repeat(241)}
      </Button>,
    );
    await completeHandshake(socket);

    await packetInterceptor.assertNoMoreData();
    expectRenderErrorMessage('Button text too long');
  });

  it('should send a button when text is at the maximum length', async () => {
    const { root, packetInterceptor, socket } = await connectAndWaitForISI();
    const maxLengthText = 'a'.repeat(240);

    root.render(
      <Button width={20} height={5}>
        {maxLengthText}
      </Button>,
    );
    await completeHandshake(socket);

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
    const { root } = await connectAndWaitForISI();

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
  });
});
