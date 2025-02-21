import type { ForwardedRef } from 'react';
import { createElement, forwardRef } from 'react';
import {
  useConnectionMaybeScope,
  useGlobalScope,
  useHumanPlayerMaybeScope,
} from 'react-node-insim';

import { useInSimContext } from '../internals/InSimContext';
import type { ButtonElementProps } from '../renderer/inSim/elements';
import { ButtonElement } from '../renderer/inSim/elements';
import type { WithPartial } from '../types';
import { useStackContext } from './layout/Stack';

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

export const Button = forwardRef(function Button(
  {
    flexDirection = 'row',
    UCID: UCIDProp = 0,
    textAlign = 'center',
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
  const stackContext = useStackContext();

  const width = stackContext?.width ?? props.width;
  const UCID = isGlobal
    ? ButtonElement.UCID_ALL
    : player?.UCID ?? connection?.UCID ?? UCIDProp;

  return createElement<ButtonElementProps>('lfs-button', {
    ...props,
    width,
    shouldClearAllButtons,
    isConnected,
    UCID,
    textAlign,
    isDisabled,
    initializeDialogWithButtonText,
    caption,
    maxTypeInChars,
    isAlwaysOnScreen,
    flexDirection,
    ref,
  });
});
