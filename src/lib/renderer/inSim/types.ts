import type { InSim } from 'node-insim';
import type { YogaNode } from 'yoga-layout-prebuilt';

import type { InSimElement } from './InSimElement';
import type { InSimElement_OLD } from './InSimElement_OLD';

type UCID = number;

/** @deprecated */
export type Container_OLD = {
  rootID: string;
  inSim: InSim;
  children: Instance_OLD[];
  pendingChildren: Instance_OLD[];

  /**
   * ClickID1: [UCID1, UCID2,      , UCID4]
   * ClickID2: [UCID1, UCID2, UCID3, UCID4]
   * ClickID2: [              UCID3, UCID4]
   */
  buttonUCIDsByClickID: Set<UCID>[];
  buttonClickIDStart: number;
  appendButtonIDs: boolean;
};

export type Container = {
  readonly type: 'root';
  rootID: string;
  inSim: InSim;
  children: Instance[];
  pendingChildren: Instance[];
  readonly node: YogaNode;

  /**
   * ClickID1: [UCID1, UCID2,      , UCID4]
   * ClickID2: [UCID1, UCID2, UCID3, UCID4]
   * ClickID2: [              UCID3, UCID4]
   */
  buttonUCIDsByClickID: Set<UCID>[];
  buttonClickIDStart: number;
  appendButtonIDs: boolean;
};

export type Type = 'btn' | 'flex' | 'lfs-button';

export type Props = Record<string, unknown>;

type TextChild = string | number;

export type TextChildren = TextChild | TextChild[];

/** @deprecated */
export type Children_OLD = Instance_OLD[];
export type Children = Instance[];

/** @deprecated */
export type Instance_OLD = InSimElement_OLD;
export type Instance = InSimElement;

export type PublicInstance<T extends Instance> = Omit<
  T,
  'commitMount' | 'commitUpdate' | 'detachDeletedInstance'
>;

export type HostContext = object;

// eslint-disable-next-line @typescript-eslint/ban-types
export type UpdatePayload<Props extends Record<string, unknown> = {}> =
  | (keyof Props)[];
