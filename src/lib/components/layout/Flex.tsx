import { createElement } from 'react';

import { useInSimContext } from '../../internals/InSimContext';
import type { StyleProps } from '../../renderer/inSim/styleProps';
import type { ButtonChild } from '../types';

export type FlexProps = StyleProps & {
  children: ButtonChild | ButtonChild[];
  backgroundColor?: 'light' | 'dark';
  borderColor?: 'light' | 'dark';
};

export function Flex({ flexDirection = 'row', ...props }: FlexProps) {
  const { shouldClearAllButtons, isConnected } = useInSimContext();

  return createElement<
    FlexProps & {
      isConnected: boolean;
    }
  >('flex', {
    ...props,
    flexDirection,
    isConnected,
  });
}
