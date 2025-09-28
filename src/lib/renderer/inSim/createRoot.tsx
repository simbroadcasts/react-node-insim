import { Provider as JotaiProvider } from 'jotai/react';
import type { InSim } from 'node-insim';
import { IS_BTN, PacketType } from 'node-insim/packets';
import type { ReactNode } from 'react';
import type { OpaqueRoot } from 'react-reconciler';
import { ConcurrentRoot } from 'react-reconciler/constants';

import { InSimContextProvider } from '../../internals/InSimContext';
import { log } from '../../internals/logger';
import { InSimRenderer } from './InSimRenderer';
import type { Container } from './types';

export type CreateRootOptions = {
  appendButtonIDs?: boolean;
  buttonClickIDStart?: number;
};

const rootContainers = new Map<string, Container>();
const roots = new Map<string, OpaqueRoot>();

let idCounter = 0;

export function createRoot(
  inSim: InSim,
  { appendButtonIDs = false, buttonClickIDStart = 0 }: CreateRootOptions = {},
) {
  if (inSim.options.ReqI === undefined || inSim.options.ReqI === 0) {
    throw new Error(
      `Failed to create root - 'ReqI' property in InSim options must be non-zero.`,
    );
  }

  if (buttonClickIDStart < 0) {
    throw new Error(
      `Failed to create root - 'buttonClickIDStart' cannot be negative.`,
    );
  }

  if (buttonClickIDStart > IS_BTN.MAX_CLICK_ID) {
    throw new Error(
      `Failed to create root - 'buttonClickIDStart' must be smaller than ${IS_BTN.MAX_CLICK_ID}.`,
    );
  }

  const rootID = '' + idCounter++;
  const container: Container = {
    rootID,
    inSim,
    pendingChildren: [],
    children: [],
    buttonUCIDsByClickID: [],
    buttonClickIDStart,
    appendButtonIDs,
  };
  rootContainers.set(rootID, container);
  const fiberRoot = InSimRenderer.createContainer(
    container,
    ConcurrentRoot,
    null,
    false,
    false,
    '',
    function (error: unknown) {
      console.error(error);
    },
    null,
  );

  if (process.env['DEV'] === 'true') {
    InSimRenderer.injectIntoDevTools({
      bundleType: 1,
      version: '18.2.0',
      rendererPackageName: 'react-node-insim',
    });
  }

  roots.set(rootID, fiberRoot);

  // When a connection leaves, remove their UCID from all buttons
  inSim.on(PacketType.ISP_CNL, (packet) => {
    container.buttonUCIDsByClickID.forEach((ucIds, clickID) => {
      if (ucIds.has(packet.UCID)) {
        log(`removing UCID ${packet.UCID} from clickID ${clickID}`);
        ucIds.delete(packet.UCID);
      }
    });
  });

  return {
    render(children: ReactNode) {
      InSimRenderer.updateContainer(
        <InSimContextProvider
          inSim={inSim}
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          connectRequestId={inSim.options.ReqI!}
        >
          <JotaiProvider>{children}</JotaiProvider>
        </InSimContextProvider>,
        fiberRoot,
        null,
        null,
      );
    },
  };
}
