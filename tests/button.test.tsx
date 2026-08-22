import type { InSim } from 'node-insim';
import { IS_BTN } from 'node-insim/packets';
import { afterEach, beforeEach, describe, it } from 'vitest';

import { Button, createRoot } from '../src';
import type { getTCPConnectionPromise } from './packetInterceptor';
import {
  beginInSimConnection,
  connectAndCompleteHandshake,
} from './packetInterceptor';

describe('Buttons', () => {
  let inSim: InSim;
  let waitForTCPConnection: ReturnType<typeof getTCPConnectionPromise>;
  let cleanup: () => void;

  beforeEach(() => {
    ({ inSim, waitForTCPConnection, cleanup } = beginInSimConnection());
  });

  afterEach(() => {
    cleanup();
  });

  it('should send a button', async () => {
    const root = createRoot(inSim);
    root.render(
      <Button width={20} height={5}>
        Hello world
      </Button>,
    );

    const { packetInterceptor } =
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

    const { packetInterceptor } = await connectAndCompleteHandshake(
      waitForTCPConnection,
      50,
    );

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
