import { describe, it } from 'vitest';

import { createRoot } from '../src';
import { beginInSimConnection, waitForISIHandshake } from './packetInterceptor';

describe('InSim connection', () => {
  it('should connect to InSim and send an IS_ISI packet', async () => {
    const { inSim, waitForTCPConnection, cleanup } = beginInSimConnection();

    createRoot(inSim);

    const { packetInterceptor } =
      await waitForISIHandshake(waitForTCPConnection);

    await packetInterceptor.assertNoMoreData();

    cleanup();
  });
});
