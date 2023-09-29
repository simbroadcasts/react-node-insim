import type { ForwardedRef } from 'react';
import { createElement, forwardRef } from 'react';

import { useInSimContext } from '../internals/InSimContext';
import type { ButtonElement, ButtonElementProps } from '../renderer/inSim';
import type { WithPartial } from '../types';

export type ButtonProps = WithPartial<
  Omit<ButtonElementProps, 'shouldClearAllButtons' | 'isConnected'>,
  | 'top'
  | 'left'
  | 'width'
  | 'height'
  | 'UCID'
  | 'align'
  | 'isDisabled'
  | 'initializeDialogWithButtonText'
  | 'caption'
  | 'maxTypeInChars'
>;

export const Button = forwardRef(function Button(
  {
    top = 0,
    left = 0,
    width = 0,
    height = 0,
    UCID = 0,
    align = 'center',
    isDisabled = false,
    initializeDialogWithButtonText = false,
    caption = '',
    maxTypeInChars = 95,
    ...props
  }: ButtonProps,
  ref: ForwardedRef<ButtonElement>,
) {
  const { shouldClearAllButtons, isConnected } = useInSimContext();

  return createElement<ButtonElementProps>('btn', {
    shouldClearAllButtons,
    isConnected,
    top,
    left,
    width,
    height,
    UCID,
    align,
    isDisabled,
    initializeDialogWithButtonText,
    caption,
    maxTypeInChars,
    ...props,
    ref,
  });
});
