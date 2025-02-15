import type { ForwardedRef } from 'react';
import { createElement, forwardRef } from 'react';

import { useInSimContext } from '../internals/InSimContext';
import type { ButtonElement, ButtonElementProps } from '../renderer/inSim';
import { useConnectionMaybeScope } from '../scopes/connectionScope';
import { useGlobalScope } from '../scopes/globalScope';
import { useHumanPlayerMaybeScope } from '../scopes/humanPlayerScope';
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
  | 'isAlwaysOnScreen'
>;

export const Button = forwardRef(function Button(
  {
    top = 0,
    left = 0,
    width = 0,
    height = 0,
    UCID: UCIDProp = 0,
    align = 'center',
    isDisabled = false,
    initializeDialogWithButtonText = false,
    caption = '',
    maxTypeInChars = 95,
    isAlwaysOnScreen = false,
    ...props
  }: ButtonProps,
  ref: ForwardedRef<ButtonElement>,
) {
  const { shouldClearAllButtons, isConnected } = useInSimContext();
  const isGlobal = useGlobalScope();
  const connection = useConnectionMaybeScope();
  const player = useHumanPlayerMaybeScope();

  const UCID = isGlobal ? 255 : player?.UCID ?? connection?.UCID ?? UCIDProp;

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
    isAlwaysOnScreen,
    ...props,
    ref,
  });
});
