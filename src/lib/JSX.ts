import type { Key, Ref } from 'react';

import type { ButtonProps, FlexProps } from './components';

export type Children = string | number;

export type InSimElementProps<RefElement, Props> = Props & {
  ref?: Ref<RefElement>;
  key?: Key;
  shouldClearAllButtons?: boolean;
};

export interface InSimElements {
  btn: ButtonProps;
  flex: FlexProps;
}
