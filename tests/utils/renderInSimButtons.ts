import type { ReactElement } from 'react';
import type { CreateRootOptions } from 'react-node-insim';
import { createRoot } from 'react-node-insim';

import {
  beginInSimConnection,
  connectAndCompleteHandshake,
} from './packetInterceptor';

export type RenderInSimButtonsOptions = {
  createRootOptions?: CreateRootOptions;
  handshakeWaitMs?: number;
};

export async function renderInSimButtons(
  element: ReactElement | null,
  options?: RenderInSimButtonsOptions,
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
