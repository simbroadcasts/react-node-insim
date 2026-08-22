import { IS_BTN } from 'node-insim/packets';
import { describe, it } from 'vitest';

import { Button, createRoot } from '../src';
import {
  beginInSimConnection,
  connectAndCompleteHandshake,
} from './packetInterceptor';

describe('Button caption props', () => {
  it('should prefix the text with the caption when set', async () => {
    const { inSim, waitForTCPConnection, cleanup } = beginInSimConnection();

    const root = createRoot(inSim);
    root.render(
      <Button width={20} height={5} caption="My caption">
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
        Text: '\0My caption\0Hello',
      }),
    );
    await packetInterceptor.assertNoMoreData();

    cleanup();
  });
});
