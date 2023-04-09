import type { IS_BTC, IS_BTT } from 'node-insim/packets';
import type { ForwardedRef } from 'react';
import { createElement, forwardRef } from 'react';

import type { Button as ButtonElement } from '../elements';
import { useInSim } from '../InSimContext';
import type { Children, InSimElementProps } from '../JSX';

export type ButtonProps = InSimElementProps<ButtonElement, ButtonBaseProps>;

type ButtonBaseProps = {
  /** 0 to 240 characters of text */
  children?: Children | Children[];

  /** Connection to display the button (0 = local / 255 = all) */
  UCID?: number;

  /** Width (0 to 200) */
  width?: number;

  /** Height (0 to 200) */
  height?: number;

  /** Top offset (0 to 200) */
  top?: number;

  /** Left offset (0 to 200) */
  left?: number;

  variant?: 'transparent' | 'light' | 'dark';
  align?: 'left' | 'right' | 'center';
  color?:
    | 'lightgrey'
    | 'title'
    | 'unselected'
    | 'selected'
    | 'ok'
    | 'cancel'
    | 'textstring'
    | 'unavailable';
  flex?: number;

  /** If set, the user can click this button to type in text. This is the maximum number of characters to type in (0 to 95) */
  maxTypeInChars?: number;

  /** Initialise dialog with the button's text */
  initializeDialogWithButtonText?: boolean;

  onClick?: (packet: IS_BTC) => void;
  onType?: (packet: IS_BTT) => void;
};

export const Button = forwardRef(function Button(
  props: ButtonProps,
  ref: ForwardedRef<ButtonElement>,
) {
  const { shouldClearAllButtons } = useInSim();

  return createElement<ButtonProps>('btn', {
    shouldClearAllButtons,
    ...props,
    ref,
  });
});
