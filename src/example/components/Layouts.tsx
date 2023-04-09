import { Button, Flex, HStack } from 'node-insim-react';
import React, { Fragment, useState } from 'react';

import type { FlexProps } from '../../lib/components/Flex';

const alignContentOptions: FlexProps['alignContent'][] = [
  undefined,
  'start',
  'center',
  'end',
  'stretch',
  'auto',
  'baseline',
  'space-between',
  'space-around',
];

const alignItemsOptions: FlexProps['alignItems'][] = [
  undefined,
  'start',
  'center',
  'end',
  'stretch',
  'auto',
  'baseline',
];

const backgroundColorOptions: FlexProps['backgroundColor'][] = [
  undefined,
  'light',
  'dark',
];

const directionOptions: FlexProps['direction'][] = [
  undefined,
  'row',
  'row-reverse',
  'column',
  'column-reverse',
];

const justifyContentOptions: FlexProps['justifyContent'][] = [
  undefined,
  'start',
  'center',
  'end',
  'space-evenly',
  'space-around',
  'space-between',
];

const wrapOptions: FlexProps['wrap'][] = [
  undefined,
  'no-wrap',
  'wrap',
  'wrap-reverse',
];

const colorOptions: FlexProps['color'][] = [
  undefined,
  'lightgrey',
  'title',
  'unselected',
  'selected',
  'ok',
  'cancel',
  'textstring',
  'unavailable',
];

const variantOptions: FlexProps['variant'][] = [
  undefined,
  'dark',
  'light',
  'transparent',
];

const plusMinusOptions = ['-', '+'];

const rows: Partial<Record<keyof FlexProps, unknown[]>> = {
  top: plusMinusOptions,
  left: plusMinusOptions,
  width: [undefined, 30, 50, 90],
  height: [undefined, 30, 50, 90],
  color: colorOptions,
  backgroundColor: backgroundColorOptions,
  borderSize: plusMinusOptions,
  borderColor: variantOptions,
  variant: variantOptions,
  alignContent: alignContentOptions,
  alignItems: alignItemsOptions,
  direction: directionOptions,
  justifyContent: justifyContentOptions,
  margin: plusMinusOptions,
  marginBottom: plusMinusOptions,
  marginHorizontal: plusMinusOptions,
  marginLeft: plusMinusOptions,
  marginRight: plusMinusOptions,
  marginTop: plusMinusOptions,
  marginVertical: plusMinusOptions,
  padding: plusMinusOptions,
  paddingBottom: plusMinusOptions,
  paddingHorizontal: plusMinusOptions,
  paddingLeft: plusMinusOptions,
  paddingRight: plusMinusOptions,
  paddingTop: plusMinusOptions,
  paddingVertical: plusMinusOptions,
  wrap: wrapOptions,
};

export function Layouts() {
  const [flexProps, setFlexProps] = useState<Partial<FlexProps>>({
    backgroundColor: 'light',
    variant: 'dark',
    top: 140,
    left: 80,
  });

  const rowHeight = 4;

  return (
    <>
      {Object.entries(rows).map(([key, options], index) => {
        const flexPropValue = flexProps[key as keyof FlexProps];

        const isPlusMinus =
          options.length === 2 && options[0] === '-' && options[1] === '+';

        const allOptions = isPlusMinus
          ? [(flexPropValue ?? '[none]').toString(), ...options]
          : options;

        return (
          <Fragment key={key}>
            <Button
              width={20}
              height={rowHeight}
              top={5 + rowHeight * index}
              left={5}
              align="left"
            >
              {key}
            </Button>
            <HStack
              width={15}
              height={rowHeight}
              top={5 + rowHeight * index}
              left={25}
              variant="light"
            >
              {allOptions.map((value, index, array) => {
                const isPlusMinus =
                  array.length === 3 && array[1] === '-' && array[2] === '+';

                const valueString =
                  value !== undefined ? (value as string).toString() : '[none]';

                const variant =
                  isPlusMinus && index === 0 ? 'transparent' : undefined;
                const color =
                  flexPropValue === value ? 'selected' : 'unselected';

                return (
                  <Button
                    variant={variant}
                    color={color}
                    key={`${valueString}-${variant}`}
                    onClick={
                      isPlusMinus && index === 0
                        ? undefined
                        : () => {
                            if (
                              typeof flexPropValue === 'number' ||
                              flexPropValue === undefined
                            ) {
                              if (value === '+') {
                                setFlexProps((prevState) => {
                                  const prevValue =
                                    prevState[key as keyof FlexProps];
                                  return {
                                    ...prevState,
                                    [key]:
                                      prevValue === undefined
                                        ? 1
                                        : Number(prevValue) + 1,
                                  };
                                });
                                return;
                              }

                              if (value === '-') {
                                setFlexProps((prevState) => {
                                  const prevValue =
                                    prevState[key as keyof FlexProps];
                                  return {
                                    ...prevState,
                                    [key]:
                                      prevValue === undefined
                                        ? 0
                                        : Number(prevValue) - 1,
                                  };
                                });
                                return;
                              }
                            }

                            setFlexProps((prevState) => ({
                              ...prevState,
                              [key]: value,
                            }));
                          }
                    }
                  >
                    {valueString}
                  </Button>
                );
              })}
            </HStack>
          </Fragment>
        );
      })}

      <Flex top={120} left={70} {...flexProps}>
        <Button width={20} height={10}>
          Hello
        </Button>
        <Button width={35} height={8}>
          Flex
        </Button>
        <Button width={8} height={5}>
          Box
        </Button>
      </Flex>
    </>
  );
}
