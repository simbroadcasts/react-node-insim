import type { Key, Ref } from 'react';

import type { BtnProps } from './elements';

export type Children = string | number;

export type InSimElementProps<RefElement, Props> = Props & {
  ref?: Ref<RefElement>; // TODO
  key?: Key;
  shouldClearAllButtons?: boolean;
};

export interface InSimElements {
  btn: BtnProps;
}
