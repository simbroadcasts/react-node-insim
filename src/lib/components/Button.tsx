import type { ForwardedRef } from 'react';
import { createElement, forwardRef } from 'react';

import type { ButtonElement, ButtonElementProps } from '../elements';
import { useInSimContext } from '../internals/InSimContext';
import type { WithPartial } from '../types';

export type ButtonProps = WithPartial<
  Omit<ButtonElementProps, 'shouldClearAllButtons'>,
  | 'top'
  | 'left'
  | 'width'
  | 'height'
  | 'UCID'
  | 'align'
  | 'color'
  | 'variant'
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
    color = 'lightgrey',
    variant = 'transparent',
    initializeDialogWithButtonText = false,
    caption = '',
    maxTypeInChars = 0,
    ...props
  }: ButtonProps,
  ref: ForwardedRef<ButtonElement>,
) {
  const { shouldClearAllButtons } = useInSimContext();

  return createElement<ButtonElementProps>('btn', {
    shouldClearAllButtons,
    top,
    left,
    width,
    height,
    UCID,
    align,
    color,
    variant,
    initializeDialogWithButtonText,
    caption,
    maxTypeInChars,
    ...props,
    ref,
  });
});
