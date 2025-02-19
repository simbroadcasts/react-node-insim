import { createElement } from 'react';

import { useInSimContext } from '../internals/InSimContext';
import type { TextChildren } from '../renderer/inSim';

export type NewButtonProps = {
  width: number;
  height: number;
  children: TextChildren;
};

export function NewButton({ width, height, children }: NewButtonProps) {
  const { shouldClearAllButtons, isConnected } = useInSimContext();

  return createElement<
    NewButtonProps & {
      isConnected: boolean;
    }
  >('lfs-button', {
    width,
    height,
    children,
    isConnected,
  });
}
