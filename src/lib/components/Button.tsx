import type { ForwardedRef } from 'react';
import { createElement, forwardRef } from 'react';

import type { ButtonElement, ButtonElementProps } from '../elements';
import { useInSimContext } from '../InSimContext';

export type ButtonProps = Omit<ButtonElementProps, 'shouldClearAllButtons'>;

export const Button = forwardRef(function Button(
  props: ButtonProps,
  ref: ForwardedRef<ButtonElement>,
) {
  const { shouldClearAllButtons } = useInSimContext();

  return createElement<ButtonElementProps>('btn', {
    shouldClearAllButtons,
    ...props,
    ref,
  });
});
