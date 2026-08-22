import { IS_BTN } from 'node-insim/packets';
import type { ReactElement } from 'react';
import { describe, it } from 'vitest';

import type { CreateRootOptions } from '../src';
import { Button, createRoot } from '../src';
import {
  beginInSimConnection,
  connectAndCompleteHandshake,
} from './packetInterceptor';

async function renderButtons(
  buttons: ReactElement,
  options?: CreateRootOptions,
) {
  const { inSim, waitForTCPConnection, cleanup } = beginInSimConnection();

  const root = createRoot(inSim, options);
  root.render(buttons);

  const { packetInterceptor } =
    await connectAndCompleteHandshake(waitForTCPConnection);

  return { packetInterceptor, cleanup };
}

describe('Button ClickID allocation', () => {
  it('should reuse the same ClickID for buttons with different UCIDs', async () => {
    const { packetInterceptor, cleanup } = await renderButtons(
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
    await packetInterceptor.assertNoMoreData();

    cleanup();
  });

  it('should allocate different ClickIDs for buttons with the same UCID', async () => {
    const { packetInterceptor, cleanup } = await renderButtons(
      <>
        <Button UCID={5} width={20} height={5}>
          A
        </Button>
        <Button UCID={5} width={20} height={5}>
          B
        </Button>
      </>,
    );

    await packetInterceptor.waitForPacket(
      new IS_BTN({ ClickID: 0, ReqI: 1, UCID: 5, W: 20, H: 5, Text: 'A' }),
    );
    await packetInterceptor.waitForPacket(
      new IS_BTN({ ClickID: 1, ReqI: 1, UCID: 5, W: 20, H: 5, Text: 'B' }),
    );
    await packetInterceptor.assertNoMoreData();

    cleanup();
  });

  it('should only allocate a fully free ClickID for a UCID=255 (all) button, and keep it reserved for later buttons', async () => {
    const { packetInterceptor, cleanup } = await renderButtons(
      <>
        <Button UCID={1} width={20} height={5}>
          A
        </Button>
        <Button UCID={255} width={20} height={5}>
          B
        </Button>
        <Button UCID={2} width={20} height={5}>
          C
        </Button>
      </>,
    );

    // A takes the first (empty) slot.
    await packetInterceptor.waitForPacket(
      new IS_BTN({ ClickID: 0, ReqI: 1, UCID: 1, W: 20, H: 5, Text: 'A' }),
    );
    // B (all connections) cannot reuse A's slot, since it isn't empty - a
    // new slot is allocated instead.
    await packetInterceptor.waitForPacket(
      new IS_BTN({ ClickID: 1, ReqI: 1, UCID: 255, W: 20, H: 5, Text: 'B' }),
    );
    // C can reuse A's slot, since UCID 2 isn't in it yet.
    await packetInterceptor.waitForPacket(
      new IS_BTN({ ClickID: 0, ReqI: 1, UCID: 2, W: 20, H: 5, Text: 'C' }),
    );
    await packetInterceptor.assertNoMoreData();

    cleanup();
  });

  it('should offset allocated ClickIDs by buttonClickIDStart', async () => {
    const { packetInterceptor, cleanup } = await renderButtons(
      <Button width={20} height={5}>
        Hello
      </Button>,
      { buttonClickIDStart: 10 },
    );

    await packetInterceptor.waitForPacket(
      new IS_BTN({ ClickID: 10, ReqI: 1, W: 20, H: 5, Text: 'Hello' }),
    );
    await packetInterceptor.assertNoMoreData();

    cleanup();
  });
});
