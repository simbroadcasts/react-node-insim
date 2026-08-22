import { IS_BTN } from 'node-insim/packets';
import { describe, it } from 'vitest';

import { Button, createRoot } from '../src';
import {
  beginInSimConnection,
  connectAndCompleteHandshake,
} from './packetInterceptor';

describe('Button always on screen', () => {
  it('should set Inst to INST_ALWAYS_ON when isAlwaysOnScreen is set', async () => {
    const { inSim, waitForTCPConnection, cleanup } = beginInSimConnection();

    const root = createRoot(inSim);
    root.render(
      <Button width={20} height={5} isAlwaysOnScreen>
        Hello
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
        Text: 'Hello',
        Inst: IS_BTN.INST_ALWAYS_ON,
      }),
    );
    await packetInterceptor.assertNoMoreData();

    cleanup();
  });

  it('should not set Inst when isAlwaysOnScreen is not set', async () => {
    const { inSim, waitForTCPConnection, cleanup } = beginInSimConnection();

    const root = createRoot(inSim);
    root.render(
      <Button width={20} height={5}>
        Hello
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
        Text: 'Hello',
        Inst: 0,
      }),
    );
    await packetInterceptor.assertNoMoreData();

    cleanup();
  });
});
