import type { ReactElement } from 'react';
import React, { Children, cloneElement } from 'react';
import type {
  YogaAlign,
  YogaFlexDirection,
  YogaFlexWrap,
  YogaJustifyContent,
} from 'yoga-layout-prebuilt';
import yoga from 'yoga-layout-prebuilt';

import type { BtnProps } from '../elements';
import { Button } from './Button';

type Props = PositionProps &
  Partial<Pick<BtnProps, 'width' | 'height' | 'variant' | 'color'>> &
  FlexProps & {
    children: ButtonChild | ButtonChild[];
    backgroundColor?: 'light' | 'dark';
  };

type ButtonChild = ReactElement<BtnProps>;

type PositionProps = Required<Pick<BtnProps, 'top' | 'left'>>;

type FlexProps = {
  direction?: 'row' | 'column';
  justifyContent?:
    | 'left'
    | 'center'
    | 'right'
    | 'space-evenly'
    | 'space-around'
    | 'space-between';
  alignItems?:
    | 'left'
    | 'center'
    | 'right'
    | 'stretch'
    | 'space-around'
    | 'space-between';
  alignContent?:
    | 'left'
    | 'center'
    | 'right'
    | 'stretch'
    | 'space-around'
    | 'space-between';
  wrap?: 'no-wrap' | 'wrap' | 'wrap-reverse';
  padding?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
};

export function Flex({
  children,
  direction,
  justifyContent,
  alignItems,
  alignContent,
  wrap,
  padding,
  paddingLeft,
  paddingRight,
  paddingTop,
  paddingBottom,
  top: topOffset,
  left: leftOffset,
  width,
  height,
  variant,
  color,
  backgroundColor,
}: Props) {
  const root = yoga.Node.create();
  root.setWidth(width ?? 0);
  root.setHeight(height ?? 0);
  justifyContent && root.setJustifyContent(justifyContentMap[justifyContent]);
  direction && root.setFlexDirection(directionMap[direction]);
  alignItems && root.setAlignItems(alignMap[alignItems]);
  alignContent && root.setAlignContent(alignMap[alignContent]);
  wrap && root.setFlexWrap(flexWrapMap[wrap]);
  padding !== undefined && root.setPadding(yoga.EDGE_ALL, padding);
  paddingLeft !== undefined && root.setPadding(yoga.EDGE_LEFT, paddingLeft);
  paddingRight !== undefined && root.setPadding(yoga.EDGE_RIGHT, paddingRight);
  paddingTop !== undefined && root.setPadding(yoga.EDGE_TOP, paddingTop);
  paddingBottom !== undefined &&
    root.setPadding(yoga.EDGE_BOTTOM, paddingBottom);

  Children.forEach(children, (child, index) => {
    if (child.type !== Button) {
      return;
    }

    const buttonNode = yoga.Node.create();
    buttonNode.setWidth(child.props.width ?? 0);
    buttonNode.setHeight(child.props.height ?? 0);

    root.insertChild(buttonNode, index);
  });

  root.calculateLayout(width, height);

  return (
    <>
      {backgroundColor && (
        <Button
          width={width}
          height={height}
          top={topOffset}
          left={leftOffset}
          variant={backgroundColor}
        />
      )}
      {Children.map(children, (child, index) => {
        if (child.type !== Button) {
          return;
        }

        const buttonNode = root.getChild(index);

        const { top, left, width, height } = buttonNode.getComputedLayout();

        return cloneElement(child, {
          top: top + topOffset,
          left: left + leftOffset,
          width,
          height,
          variant: child.props.variant ?? variant,
          color: child.props.color ?? color,
        });
      })}
    </>
  );
}

const directionMap: Record<
  NonNullable<Props['direction']>,
  YogaFlexDirection
> = {
  row: yoga.FLEX_DIRECTION_ROW,
  column: yoga.FLEX_DIRECTION_COLUMN,
};

const justifyContentMap: Record<
  NonNullable<Props['justifyContent']>,
  YogaJustifyContent
> = {
  left: yoga.JUSTIFY_FLEX_START,
  center: yoga.JUSTIFY_CENTER,
  right: yoga.JUSTIFY_FLEX_END,
  'space-evenly': yoga.JUSTIFY_SPACE_EVENLY,
  'space-around': yoga.JUSTIFY_SPACE_AROUND,
  'space-between': yoga.JUSTIFY_SPACE_BETWEEN,
};

const alignMap: Record<NonNullable<Props['alignItems']>, YogaAlign> = {
  left: yoga.ALIGN_FLEX_START,
  center: yoga.ALIGN_CENTER,
  right: yoga.ALIGN_FLEX_END,
  stretch: yoga.ALIGN_STRETCH,
  'space-around': yoga.ALIGN_SPACE_AROUND,
  'space-between': yoga.ALIGN_SPACE_BETWEEN,
};

const flexWrapMap: Record<NonNullable<Props['wrap']>, YogaFlexWrap> = {
  wrap: yoga.WRAP_WRAP,
  'no-wrap': yoga.WRAP_NO_WRAP,
  'wrap-reverse': yoga.WRAP_WRAP_REVERSE,
};
