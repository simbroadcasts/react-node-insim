import { InSim } from 'node-insim';
import type { InSimFlags } from 'node-insim/packets';
import { PacketType } from 'node-insim/packets';
import type { ReactNode } from 'react';
import type { OpaqueRoot } from 'react-reconciler';
import { ConcurrentRoot } from 'react-reconciler/constants';

import { InSimContextProvider } from '../../internals/InSimContext';
import { log } from '../../internals/logger';
import { InSimRenderer } from './InSimRenderer';
import type { Container } from './types';

type CreateRootOptions = {
  name: string;
  host: string;
  port: number;
  adminPassword?: string;
  flags?: InSimFlags;
  prefix?: string;
  appendButtonIDs?: boolean;
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
  appendButtonIDs = false,
}: CreateRootOptions) {
  const inSim = new InSim();

  const rootID = '' + idCounter++;
  const container: Container = {
    rootID,
    inSim,
    pendingChildren: [],
    children: [],
    buttonUCIDsByClickID: [],
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
  });

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
          {children}
        </InSimContextProvider>,
        fiberRoot,
        null,
        null,
      );
    },
  };
}
