import { createElement } from 'react';

import type { ButtonChild } from './types';

export type NewFlexProps = {
  width: number;
  height: number;
  children: ButtonChild | ButtonChild[];
};

export function NewFlex({ width, height, children }: NewFlexProps) {
  return createElement<NewFlexProps>('flex', {
    width,
    height,
    children,
  });
}
