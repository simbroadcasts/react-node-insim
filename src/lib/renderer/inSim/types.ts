import type { InSimElement } from './InSimElement';
import type { RootElement } from './RootElement';

export type Container = RootElement;

export type Type = 'btn' | 'flex' | 'lfs-button';

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
