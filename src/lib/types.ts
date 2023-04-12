import type { InSim } from 'node-insim';

import type { InSimElement } from './InSimElement';

export type Container = {
  rootID: string;
  inSim: InSim;
  children: Instance[];
  pendingChildren: Instance[];
  renderedButtonIds: Set<number>;
  nextClickId: number;
};

export type Type = 'btn' | 'flex';

export type Props = Record<string, unknown>;

export type TextChildren = string | number;

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
