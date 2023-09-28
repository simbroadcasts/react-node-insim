import { Container, Node } from '@welefen/grid-layout';
import type { ReactElement } from 'react';
import { Children, cloneElement, Fragment } from 'react';

import type { ButtonProps } from '../Button';
import { Button } from '../Button';
import type { GridButtonProps } from './GridButton';
import { GridButton } from './GridButton';

export type GridProps = PositionProps &
  Partial<Pick<ButtonProps, 'variant' | 'color' | 'UCID'>> &
  GridConfigProps & {
    children: ButtonChild | ButtonChild[];
    backgroundColor?: 'light' | 'dark';
  };

type ButtonChild = ReactElement<GridButtonProps>;

type PositionProps = Required<
  Pick<ButtonProps, 'top' | 'left' | 'width' | 'height'>
>;

type GridConfigProps = Container['config'];

export function Grid({
  children,
  top,
  left,
  width,
  height,
  variant,
  color,
  backgroundColor,
  gridTemplateColumns,
  gridAutoColumns,
  gridAutoFlow,
  gridAutoRows,
  gridColumnGap,
  gridRowGap,
  gridTemplateAreas,
  gridTemplateRows,
  alignItems,
  justifyContent,
  alignContent,
  justifyItems,
  UCID,
}: GridProps) {
  const container = new Container({
    width,
    height,
    gridTemplateColumns,
    gridAutoColumns,
    gridAutoFlow,
    gridAutoRows,
    gridColumnGap,
    gridRowGap,
    gridTemplateAreas,
    gridTemplateRows,
    alignItems,
    justifyContent,
    alignContent,
    justifyItems,
  });

  Children.forEach(children, (child) => {
    if (!isValidChild(child)) {
      return;
    }

    const node = new Node({
      width: child.props.width,
      height: child.props.height,
      gridArea: child.props.gridArea,
      gridRowStart: child.props.gridRowStart,
      gridRowEnd: child.props.gridRowEnd,
      gridColumnStart: child.props.gridColumnStart,
      gridColumnEnd: child.props.gridColumnEnd,
      alignSelf: child.props.alignSelf,
      justifySelf: child.props.justifySelf,
      // padding: child.props.padding ?? 0,
      paddingBottom: child.props.paddingBottom ?? 0,
      paddingTop: child.props.paddingTop ?? 0,
      paddingLeft: child.props.paddingLeft ?? 0,
      paddingRight: child.props.paddingRight ?? 0,
      // margin: child.props.margin ?? 0,
      marginBottom: child.props.marginBottom ?? 0,
      marginTop: child.props.marginTop ?? 0,
      marginLeft: child.props.marginLeft ?? 0,
      marginRight: child.props.marginRight ?? 0,
    });

    container.appendChild(node);
  });

  container.calculateLayout();
  const result = container.getAllComputedLayout();

  return (
    <>
      {backgroundColor && (
        <Button
          width={width}
          height={height}
          top={top}
          left={left}
          variant={backgroundColor}
          UCID={UCID}
        />
      )}
      <Fragment key={backgroundColor}>
        {Children.map(children, (child, index) => {
          if (!isValidChild(child)) {
            return;
          }

          if (!result.children) {
            return;
          }

          const buttonNode = result.children[index];
          const {
            top: buttonTop = 0,
            left: buttonLeft = 0,
            width: childWidth = 0,
            height: childHeight = 0,
          } = buttonNode;

          return cloneElement(child, {
            ...child.props,
            top: Math.round(buttonTop) + (top ?? 0),
            left: Math.round(buttonLeft) + (left ?? 0),
            width: Math.round(childWidth),
            height: Math.round(childHeight),
            variant: child.props.variant ?? variant,
            color: child.props.color ?? color,
            UCID: child.props.UCID ?? UCID,
          });
        })}
      </Fragment>
    </>
  );
}

const isValidChild = (child: ReactElement) => child.type === GridButton;
