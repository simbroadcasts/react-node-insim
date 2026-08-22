import type { ReactElement } from 'react';

import type { CreateRootOptions } from '../src';
import { createRoot } from '../src';
import {
  beginInSimConnection,
  connectAndCompleteHandshake,
} from './packetInterceptor';

export async function renderInSimButtons(
  element: ReactElement | null,
  options?: {
    createRootOptions?: CreateRootOptions;
    handshakeWaitMs?: number;
  },
) {
  const { inSim, waitForTCPConnection, cleanup } = beginInSimConnection();

  const root = createRoot(inSim, options?.createRootOptions);
  root.render(element);

  const { socket, packetInterceptor } = await connectAndCompleteHandshake(
    waitForTCPConnection,
    options?.handshakeWaitMs,
  );

  return {
    inSim,
    root,
    socket,
    packetInterceptor,
    cleanup,
  };
}
