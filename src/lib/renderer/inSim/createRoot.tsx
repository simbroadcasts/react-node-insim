import { Provider as JotaiProvider } from 'jotai/react';
import { InSim } from 'node-insim';
import type { InSimFlags } from 'node-insim/packets';
import { IS_BTN } from 'node-insim/packets';
import type { ReactNode } from 'react';
import type { OpaqueRoot } from 'react-reconciler';
import { ConcurrentRoot } from 'react-reconciler/constants';

import { InSimContextProvider } from '../../internals/InSimContext';
import { InSimRenderer } from './InSimRenderer';
import { RootElement } from './RootElement';
import type { StyleProps } from './styleProps';

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
  rootNodeStyle?: StyleProps;
};

export const CONNECT_REQUEST_ID = 255;

const rootContainers = new Map<string, RootElement>();
const roots = new Map<string, OpaqueRoot>();

let rootIdCounter = 0;

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
  rootNodeStyle = {},
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
  const rootID = '' + rootIdCounter++;
  const container = new RootElement(
    rootID,
    inSim,
    rootNodeStyle,
    buttonClickIDStart,
    appendButtonIDs,
  );
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
