import type { ReactElement } from 'react';
import { Children, cloneElement } from 'react';

import type { ButtonElementProps } from '../elements';
import { Button } from './Button';

type ButtonChild = ReactElement<ButtonElementProps>;

export type StackProps = Required<Pick<ButtonElementProps, 'top' | 'left'>> &
  Partial<
    Pick<ButtonElementProps, 'width' | 'height' | 'variant' | 'color'>
  > & {
    direction: 'horizontal' | 'vertical';
    children: ButtonChild | ButtonChild[];
  };

export function Stack({
  children,
  direction,
  top,
  left,
  width,
  height,
  variant,
  color,
}: StackProps) {
  return (
    <>
      {(() => {
        let heightBefore = 0;
        let widthBefore = 0;

        return Children.map(children, (child) => {
          if (child.type !== Button) {
            return;
          }

          const isVertical = direction === 'vertical';

          const buttonHeight = child.props.height ?? height ?? 0;
          const buttonWidth = child.props.width ?? width ?? 0;

          const buttonTop = top + heightBefore;
          const buttonLeft = left + widthBefore;

          if (isVertical) {
            heightBefore += buttonHeight;
          } else {
            widthBefore += buttonWidth;
          }

          return cloneElement(child, {
            top: buttonTop,
            left: buttonLeft,
            width: buttonWidth,
            height: buttonHeight,
            variant: child.props.variant ?? variant,
            color: child.props.color ?? color,
          });
        });
      })()}
    </>
  );
}
