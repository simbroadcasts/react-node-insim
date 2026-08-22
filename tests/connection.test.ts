import { describe, it } from 'vitest';

import { createRoot } from '../src';
import {
  beginInSimConnection,
  waitForInSimInitPacket,
} from './packetInterceptor';

describe('InSim connection', () => {
  it('should connect to InSim and send an IS_ISI packet', async () => {
    const { inSim, waitForTCPConnection, cleanup } = beginInSimConnection();

    createRoot(inSim);

    const { packetInterceptor } =
      await waitForInSimInitPacket(waitForTCPConnection);

    await packetInterceptor.assertNoMoreData();

    cleanup();
  });
});
