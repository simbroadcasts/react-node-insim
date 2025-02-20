import { Provider as JotaiProvider } from 'jotai/react';
import { InSim } from 'node-insim';
import type { InSimFlags } from 'node-insim/packets';
import { IS_BTN, PacketType } from 'node-insim/packets';
import type { ReactNode } from 'react';
import type { OpaqueRoot } from 'react-reconciler';
import { ConcurrentRoot } from 'react-reconciler/constants';
import Yoga from 'yoga-layout-prebuilt';

import { InSimContextProvider } from '../../internals/InSimContext';
import { log } from '../../internals/logger';
import { InSimRenderer } from './InSimRenderer';
import type { Container } from './types';

export type CreateRootOptions = {
  name: string;
  host: string;
  port: number;
  adminPassword?: string;
  flags?: InSimFlags;
  prefix?: string;
  UDPPort?: number;
  interval?: number;
  appendButtonIDs?: boolean;
  buttonClickIDStart?: number;
};

export const CONNECT_REQUEST_ID = 255;

const rootContainers = new Map<string, Container>();
const roots = new Map<string, OpaqueRoot>();

let idCounter = 0;

export function createRoot({
  name,
  host,
  port,
  adminPassword,
  flags,
  prefix,
  UDPPort,
  interval,
  appendButtonIDs = false,
  buttonClickIDStart = 0,
}: CreateRootOptions) {
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

  const inSim = new InSim();

  const rootID = '' + idCounter++;
  const node = Yoga.Node.create();
  node.setWidth(200);
  node.setHeight(200);
  node.setDisplay(Yoga.DISPLAY_FLEX);
  node.setFlexDirection(Yoga.FLEX_DIRECTION_ROW);
  const container: Container = {
    type: 'root',
    node,
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

  roots.set(rootID, fiberRoot);

  inSim.connect({
    ReqI: CONNECT_REQUEST_ID,
    IName: name,
    Host: host,
    Port: port,
    Admin: adminPassword,
    Flags: flags,
    Prefix: prefix,
    UDPPort,
    Interval: interval,
  });

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
          connectRequestId={CONNECT_REQUEST_ID}
        >
          <JotaiProvider>{children}</JotaiProvider>
        </InSimContextProvider>,
        fiberRoot,
        null,
        null,
      );
    },
    inSim,
  };
}
