import { createElement } from 'react';

import { useInSimContext } from '../../internals/InSimContext';
import type { FlexElementProps } from '../../renderer/inSim/elements/FlexElement';
import { useStackContext } from './Stack';

export type FlexProps = Omit<
  FlexElementProps,
  'shouldClearAllButtons' | 'isConnected'
>;

export function Flex({ flexDirection = 'row', ...props }: FlexProps) {
  const { shouldClearAllButtons, isConnected } = useInSimContext();
  const stackContext = useStackContext();

  const width = stackContext?.width ?? props.width;

  return createElement<FlexElementProps>('flex', {
    ...props,
    width,
    shouldClearAllButtons,
    flexDirection,
    isConnected,
  });
}
