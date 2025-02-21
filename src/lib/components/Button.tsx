import { createElement } from 'react';

import { useInSimContext } from '../internals/InSimContext';
import type { ButtonElementProps } from '../renderer/inSim/elements/ButtonElement';
import type { WithPartial } from '../types';

export type ButtonProps = WithPartial<
  Omit<ButtonElementProps, 'shouldClearAllButtons' | 'isConnected'>,
  | 'top'
  | 'left'
  | 'width'
  | 'height'
  | 'UCID'
  | 'textAlign'
  | 'isDisabled'
  | 'initializeDialogWithButtonText'
  | 'caption'
  | 'maxTypeInChars'
  | 'isAlwaysOnScreen'
>;

export function Button({ flexDirection = 'row', ...props }: ButtonProps) {
  const { shouldClearAllButtons, isConnected } = useInSimContext();

  return createElement<
    ButtonProps & {
      isConnected: boolean;
    }
  >('lfs-button', {
    ...props,
    flexDirection,
    isConnected,
  });
}
