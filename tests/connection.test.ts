import Mitm from 'mitm';
import { InSim } from 'node-insim';
import { IS_ISI } from 'node-insim/packets';
import { describe, it } from 'vitest';

import { createRoot } from '../src';
import { getTCPConnectionPromise } from './packetInterceptor';

describe('InSim connection', () => {
  it('should connect to InSim and send an IS_ISI packet', async () => {
    const mitm: ReturnType<typeof Mitm> = Mitm();
    const inSim: InSim = new InSim();
    const waitForTCPConnection: ReturnType<typeof getTCPConnectionPromise> =
      getTCPConnectionPromise(mitm, '127.0.0.1', 29999);

    inSim.connect({
      ReqI: 255,
      Host: '127.0.0.1',
      Port: 29999,
    });

    createRoot(inSim);

    const { packetInterceptor } = await waitForTCPConnection;

    await packetInterceptor.waitForPacket(
      new IS_ISI({
        ReqI: 255,
        InSimVer: 10,
      }),
    );

    await packetInterceptor.assertNoMoreData();

    mitm.disable();
    inSim.disconnect();
  });
});
