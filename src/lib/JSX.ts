import type { Key, Ref } from 'react';

import type { BtnProps } from './Button';

export type Children = string | number;

export type InSimElementProps<RefElement, Props> = {
  ref?: Ref<RefElement>; // TODO
  key?: Key;
} & Props;

export interface InSimElements {
  btn: BtnProps;
}

export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface IntrinsicElements extends InSimElements {}
  }
}
