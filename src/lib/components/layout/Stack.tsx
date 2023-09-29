import type { ReactElement } from 'react';
import { Children, cloneElement } from 'react';

import type { ButtonProps } from '../Button';
import { Button } from '../Button';

type ButtonChild = ReactElement<ButtonProps>;

export type StackProps = Required<Pick<ButtonProps, 'top' | 'left'>> &
  Partial<
    Pick<ButtonProps, 'width' | 'height' | 'background' | 'color' | 'UCID'>
  > & {
    direction: 'horizontal' | 'vertical';

    /** Gap between each button */
    gap?: number;

    children: ButtonChild | ButtonChild[];
  };

export function Stack({
  children,
  direction,
  top,
  left,
  width,
  height,
  background,
  color,
  UCID,
  gap = 0,
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
            heightBefore += buttonHeight + gap;
          } else {
            widthBefore += buttonWidth + gap;
          }

          return cloneElement(child, {
            top: buttonTop,
            left: buttonLeft,
            width: buttonWidth,
            height: buttonHeight,
            background: child.props.background ?? background,
            color: child.props.color ?? color,
            UCID: child.props.UCID ?? UCID,
          });
        });
      })()}
    </>
  );
}
