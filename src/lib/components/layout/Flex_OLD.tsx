import type { ForwardedRef, ReactElement } from 'react';
import {
  Children,
  cloneElement,
  createElement,
  forwardRef,
  Fragment,
} from 'react';
import type {
  YogaAlign,
  YogaFlexDirection,
  YogaFlexWrap,
  YogaJustifyContent,
} from 'yoga-layout-prebuilt';
import yoga from 'yoga-layout-prebuilt';

import type { Flex_OLD as FlexElement } from '../../renderer/inSim';
import type { ButtonProps } from '../Button_OLD';
import { Button_OLD } from '../Button_OLD';
import { ToggleButton } from '../ui';

export type FlexProps = PositionProps &
  Partial<
    Pick<ButtonProps, 'width' | 'height' | 'background' | 'color' | 'UCID'>
  > &
  FlexboxProps & {
    children: ButtonChild | ButtonChild[];
    backgroundColor?: 'light' | 'dark';
    borderSize?: number;
    borderColor?: 'light' | 'dark';
  };

type ButtonChild = ReactElement<ButtonProps> | null;

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

export const Flex_OLD = forwardRef(function FlexWithRef(
  {
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
    background,
    color,
    backgroundColor,
    borderSize = 0,
    borderColor,
    UCID,
  }: FlexProps,
  ref: ForwardedRef<FlexElement>,
) {
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
    if (!isValidChild(child)) {
      return;
    }

    const childNode = yoga.Node.create();

    if (child.props.width) {
      childNode.setWidth(child.props.width);
    } else {
      childNode.setWidthAuto();
    }

    if (child.props.height) {
      childNode.setHeight(child.props.height);
    } else {
      childNode.setHeightAuto();
    }

    if (alignItems === 'stretch') {
      if (direction === 'column') {
        root.getWidth().value && childNode.setWidthAuto();
      } else {
        root.getHeight().value && childNode.setHeightAuto();
      }
    }

    child.props.flex && childNode.setFlex(child.props.flex);

    root.insertChild(childNode, index);
  });

  root.calculateLayout();
  const rootLayout = root.getComputedLayout();

  return createElement(
    'flex',
    {
      layout: rootLayout,
      ref,
    },
    <>
      {borderSize > 0 && borderColor && (
        <>
          <Button_OLD
            width={borderSize}
            height={rootLayout.height}
            top={Math.abs(rootLayout.top)}
            left={Math.abs(rootLayout.left)}
            background={borderColor}
            UCID={UCID}
          />
          <Button_OLD
            width={borderSize}
            height={rootLayout.height}
            top={Math.abs(rootLayout.top)}
            left={Math.abs(rootLayout.left) + (rootLayout.width - borderSize)}
            background={borderColor}
            UCID={UCID}
          />
          <Button_OLD
            width={rootLayout.width}
            height={borderSize}
            top={Math.abs(rootLayout.top)}
            left={Math.abs(rootLayout.left)}
            background={borderColor}
            UCID={UCID}
          />
          <Button_OLD
            width={rootLayout.width}
            height={borderSize}
            top={Math.abs(rootLayout.top) + rootLayout.height - borderSize}
            left={Math.abs(rootLayout.left)}
            background={borderColor}
            UCID={UCID}
          />
        </>
      )}
      {backgroundColor && (
        <Button_OLD
          width={rootLayout.width - borderSize * 2}
          height={rootLayout.height - borderSize * 2}
          top={Math.abs(rootLayout.top) + borderSize}
          left={Math.abs(rootLayout.left) + borderSize}
          background={backgroundColor}
          UCID={UCID}
        />
      )}
      <Fragment key={backgroundColor}>
        {Children.map(children, (child, index) => {
          if (!isValidChild(child)) {
            return;
          }

          const buttonNode = root.getChild(index);
          const { top, left, width, height } = buttonNode.getComputedLayout();

          const childWidth = Number.isNaN(buttonNode.getWidth().value)
            ? undefined
            : width;
          const childHeight = Number.isNaN(buttonNode.getHeight().value)
            ? undefined
            : height;

          return cloneElement(child, {
            top: Math.abs(rootLayout.top) + top,
            left: Math.abs(rootLayout.left) + left,
            width: childWidth,
            height: childHeight,
            background: child.props.background ?? background,
            color: child.props.color ?? color,
            UCID: child.props.UCID ?? UCID,
          });
        })}
      </Fragment>
    </>,
  );
});

const isValidChild = (child: ReactElement | null): child is ReactElement =>
  child !== null &&
  (child.type === Button_OLD ||
    child.type === ToggleButton ||
    child.type === Flex_OLD);

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
