import type { Key, Ref } from 'react';

import type { ButtonProps } from './components';

export type Children = string | number;

export type InSimElementProps<RefElement, Props> = Props & {
  ref?: Ref<RefElement>; // TODO
  key?: Key;
  shouldClearAllButtons?: boolean;
};

export interface InSimElements {
  btn: ButtonProps;
}
