import type { ReactElement } from 'react';
import React, { Children, cloneElement, Fragment } from 'react';
import type {
  YogaAlign,
  YogaFlexDirection,
  YogaFlexWrap,
  YogaJustifyContent,
} from 'yoga-layout-prebuilt';
import yoga from 'yoga-layout-prebuilt';

import type { ButtonProps } from './Button';
import { Button } from './Button';

export type FlexProps = PositionProps &
  Partial<Pick<ButtonProps, 'width' | 'height' | 'variant' | 'color'>> &
  FlexboxProps & {
    children: ButtonChild | ButtonChild[];
    backgroundColor?: 'light' | 'dark';
    borderSize?: number;
    borderColor?: 'light' | 'dark';
  };

type ButtonChild = ReactElement<ButtonProps>;

type PositionProps = Required<Pick<ButtonProps, 'top' | 'left'>>;

type FlexboxProps = {
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  justifyContent?:
    | 'start'
    | 'center'
    | 'end'
    | 'space-evenly'
    | 'space-around'
    | 'space-between';
  alignItems?: 'auto' | 'baseline' | 'start' | 'center' | 'end' | 'stretch';
  alignContent?:
    | 'auto'
    | 'baseline'
    | 'start'
    | 'center'
    | 'end'
    | 'stretch'
    | 'space-around'
    | 'space-between';
  wrap?: 'no-wrap' | 'wrap' | 'wrap-reverse';
  padding?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingVertical?: number;
  paddingHorizontal?: number;
  margin?: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
  marginVertical?: number;
  marginHorizontal?: number;
};

export function Flex({
  children,
  direction = 'row',
  justifyContent = 'start',
  alignItems = 'start',
  alignContent = 'start',
  wrap = 'no-wrap',
  padding,
  paddingLeft,
  paddingRight,
  paddingTop,
  paddingBottom,
  paddingVertical,
  paddingHorizontal,
  margin,
  marginLeft,
  marginRight,
  marginTop,
  marginBottom,
  marginVertical,
  marginHorizontal,
  top: topOffset,
  left: leftOffset,
  width,
  height,
  variant,
  color,
  backgroundColor,
  borderSize = 0,
  borderColor,
}: FlexProps) {
  const root = yoga.Node.create();

  if (width !== undefined) {
    root.setWidth(width);
  } else {
    root.setWidth(0);
    root.setWidthAuto();
  }

  if (height !== undefined) {
    root.setHeight(height);
  } else {
    root.setHeight(0);
    root.setHeightAuto();
  }

  root.setPosition(yoga.EDGE_TOP, topOffset);
  root.setPosition(yoga.EDGE_LEFT, leftOffset);

  root.setJustifyContent(justifyContentMap[justifyContent]);
  root.setFlexDirection(directionMap[direction]);
  root.setAlignItems(alignItemsMap[alignItems]);
  root.setAlignContent(alignContentMap[alignContent]);
  root.setFlexWrap(flexWrapMap[wrap]);

  root.setBorder(yoga.EDGE_ALL, borderSize);

  padding !== undefined && root.setPadding(yoga.EDGE_ALL, padding);
  paddingLeft !== undefined && root.setPadding(yoga.EDGE_LEFT, paddingLeft);
  paddingRight !== undefined && root.setPadding(yoga.EDGE_RIGHT, paddingRight);
  paddingTop !== undefined && root.setPadding(yoga.EDGE_TOP, paddingTop);
  paddingBottom !== undefined &&
    root.setPadding(yoga.EDGE_BOTTOM, paddingBottom);
  paddingVertical !== undefined &&
    root.setPadding(yoga.EDGE_VERTICAL, paddingVertical);
  paddingHorizontal !== undefined &&
    root.setPadding(yoga.EDGE_HORIZONTAL, paddingHorizontal);

  margin !== undefined && root.setMargin(yoga.EDGE_ALL, margin);
  marginLeft !== undefined && root.setMargin(yoga.EDGE_LEFT, marginLeft);
  marginRight !== undefined && root.setMargin(yoga.EDGE_RIGHT, marginRight);
  marginTop !== undefined && root.setMargin(yoga.EDGE_TOP, marginTop);
  marginBottom !== undefined && root.setMargin(yoga.EDGE_BOTTOM, marginBottom);
  marginVertical !== undefined &&
    root.setMargin(yoga.EDGE_VERTICAL, marginVertical);
  marginHorizontal !== undefined &&
    root.setMargin(yoga.EDGE_HORIZONTAL, marginHorizontal);

  Children.forEach(children, (child, index) => {
    if (child.type !== Button) {
      return;
    }

    const buttonNode = yoga.Node.create();
    buttonNode.setWidth(child.props.width ?? 0);
    buttonNode.setHeight(child.props.height ?? 0);

    if (alignItems === 'stretch') {
      if (direction === 'column') {
        root.getWidth().value && buttonNode.setWidthAuto();
      } else {
        root.getHeight().value && buttonNode.setHeightAuto();
      }
    }

    child.props.flex && buttonNode.setFlex(child.props.flex);

    root.insertChild(buttonNode, index);
  });

  root.calculateLayout();
  const rootLayout = root.getComputedLayout();

  return (
    <>
      {borderSize > 0 && borderColor && (
        <>
          <Button
            width={borderSize}
            height={rootLayout.height}
            top={Math.abs(rootLayout.top)}
            left={Math.abs(rootLayout.left)}
            variant={borderColor}
          />
          <Button
            width={borderSize}
            height={rootLayout.height}
            top={Math.abs(rootLayout.top)}
            left={Math.abs(rootLayout.left) + (rootLayout.width - borderSize)}
            variant={borderColor}
          />
          <Button
            width={rootLayout.width}
            height={borderSize}
            top={Math.abs(rootLayout.top)}
            left={Math.abs(rootLayout.left)}
            variant={borderColor}
          />
          <Button
            width={rootLayout.width}
            height={borderSize}
            top={Math.abs(rootLayout.top) + rootLayout.height - borderSize}
            left={Math.abs(rootLayout.left)}
            variant={borderColor}
          />
        </>
      )}
      {backgroundColor && (
        <Button
          width={rootLayout.width - borderSize * 2}
          height={rootLayout.height - borderSize * 2}
          top={Math.abs(rootLayout.top) + borderSize}
          left={Math.abs(rootLayout.left) + borderSize}
          variant={backgroundColor}
        />
      )}
      <Fragment key={backgroundColor}>
        {Children.map(children, (child, index) => {
          if (child.type !== Button) {
            return;
          }

          const buttonNode = root.getChild(index);
          const { top, left, width, height } = buttonNode.getComputedLayout();

          return cloneElement(child, {
            top: Math.abs(rootLayout.top) + top,
            left: Math.abs(rootLayout.left) + left,
            width,
            height,
            variant: child.props.variant ?? variant,
            color: child.props.color ?? color,
          });
        })}
      </Fragment>
    </>
  );
}

const directionMap: Record<
  NonNullable<FlexProps['direction']>,
  YogaFlexDirection
> = {
  row: yoga.FLEX_DIRECTION_ROW,
  'row-reverse': yoga.FLEX_DIRECTION_ROW_REVERSE,
  column: yoga.FLEX_DIRECTION_COLUMN,
  'column-reverse': yoga.FLEX_DIRECTION_COLUMN_REVERSE,
};

const justifyContentMap: Record<
  NonNullable<FlexProps['justifyContent']>,
  YogaJustifyContent
> = {
  start: yoga.JUSTIFY_FLEX_START,
  center: yoga.JUSTIFY_CENTER,
  end: yoga.JUSTIFY_FLEX_END,
  'space-evenly': yoga.JUSTIFY_SPACE_EVENLY,
  'space-around': yoga.JUSTIFY_SPACE_AROUND,
  'space-between': yoga.JUSTIFY_SPACE_BETWEEN,
};

const alignItemsMap: Record<NonNullable<FlexProps['alignItems']>, YogaAlign> = {
  auto: yoga.ALIGN_AUTO,
  baseline: yoga.ALIGN_BASELINE,
  start: yoga.ALIGN_FLEX_START,
  center: yoga.ALIGN_CENTER,
  end: yoga.ALIGN_FLEX_END,
  stretch: yoga.ALIGN_STRETCH,
};

const alignContentMap: Record<
  NonNullable<FlexProps['alignContent']>,
  YogaAlign
> = {
  auto: yoga.ALIGN_AUTO,
  baseline: yoga.ALIGN_BASELINE,
  start: yoga.ALIGN_FLEX_START,
  center: yoga.ALIGN_CENTER,
  end: yoga.ALIGN_FLEX_END,
  stretch: yoga.ALIGN_STRETCH,
  'space-around': yoga.ALIGN_SPACE_AROUND,
  'space-between': yoga.ALIGN_SPACE_BETWEEN,
};

const flexWrapMap: Record<NonNullable<FlexProps['wrap']>, YogaFlexWrap> = {
  wrap: yoga.WRAP_WRAP,
  'no-wrap': yoga.WRAP_NO_WRAP,
  'wrap-reverse': yoga.WRAP_WRAP_REVERSE,
};
