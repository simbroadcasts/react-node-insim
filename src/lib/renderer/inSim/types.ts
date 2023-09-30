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

// eslint-disable-next-line @typescript-eslint/ban-types
export type UpdatePayload<Props extends Record<string, unknown> = {}> =
  | (keyof Props)[];
