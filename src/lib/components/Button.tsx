import { createElement } from 'react';

import { useInSimContext } from '../internals/InSimContext';
import type { TextChildren } from '../renderer/inSim';
import type { Styles } from '../renderer/inSim/styles';

export type NewButtonProps = Styles & {
  children: TextChildren;
};

export function Button(props: NewButtonProps) {
  const { shouldClearAllButtons, isConnected } = useInSimContext();

  return createElement<
    NewButtonProps & {
      isConnected: boolean;
    }
  >('lfs-button', {
    ...props,
    isConnected,
  });
}
