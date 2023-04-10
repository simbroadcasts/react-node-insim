import type { Key, Ref } from 'react';

export type Children = string | number;

export type InSimElementProps<RefElement, Props> = Props & {
  ref?: Ref<RefElement>;
  key?: Key;
  shouldClearAllButtons?: boolean;
};
