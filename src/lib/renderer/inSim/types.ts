import type { InSim } from 'node-insim';

import type { InSimElement } from './InSimElement';

type UCID = number;

export type Container = {
  rootID: string;
  inSim: InSim;
  children: Instance[];
  pendingChildren: Instance[];

  /**
   * ClickID1: [UCID1, UCID2,      , UCID4]
   * ClickID2: [UCID1, UCID2, UCID3, UCID4]
   * ClickID2: [              UCID3, UCID4]
   */
  buttonUCIDsByClickID: Set<UCID>[];
  buttonClickIDStart: number;
  appendButtonIDs: boolean;

  /**
   * UCIDs currently known to be connected to this root (including the host,
   * UCID 0). Used to resolve which connections a UCID=255 ("all connections")
   * button should be individually sent to once some connected UCID has
   * cleared its buttons and a single broadcast can no longer reach everyone
   * correctly.
   */
  connectedUCIDs: Set<UCID>;
};

export type Type = 'btn' | 'flex';

export type Props = Record<string, unknown>;

type TextChild = string | number;

export type TextChildren = TextChild | TextChild[];

export type Children = Instance[];

export type Instance = InSimElement;

export type PublicInstance<T extends Instance> = Omit<
  T,
  'commitMount' | 'commitUpdate' | 'detachDeletedInstance'
>;

export type HostContext = object;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type UpdatePayload<Props extends Record<string, unknown> = {}> =
  (keyof Props)[];
