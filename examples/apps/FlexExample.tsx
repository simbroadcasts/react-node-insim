import { Fragment, useState } from 'react';

import type { FlexProps } from '../../src';
import { Button, Flex, HStack } from '../../src';

export function FlexExample({
  isEditorVisible,
}: {
  isEditorVisible?: boolean;
}) {
  const [flexProps, setFlexProps] = useState<Partial<FlexProps>>({
    backgroundColor: 'light',
    background: 'dark',
    top: 126,
    left: 2,
    width: 90,
    height: 30,
    borderSize: 1,
    borderColor: 'dark',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  });
  const left = 0;
  const top = 0;
  const rowHeight = 4;
  const editorWidth = 135;

  return (
    <>
      {isEditorVisible && (
        <>
          <Button
            top={top}
            left={left}
            width={10}
            height={rowHeight}
            color="title"
            align="left"
            UCID={255}
          >
            Flex props
          </Button>

          <Button
            top={top + rowHeight}
            left={left}
            width={editorWidth}
            height={114}
            UCID={255}
            background="dark"
          />
          <Button
            top={top + rowHeight}
            left={left}
            width={editorWidth}
            height={114}
            UCID={255}
            background="dark"
          />
          <Button
            top={top + rowHeight}
            left={left}
            width={editorWidth}
            height={114}
            UCID={255}
            background="light"
          />

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
                  width={17}
                  height={rowHeight}
                  top={top + rowHeight * (index + 1) + 1}
                  left={left}
                  UCID={255}
                  align="left"
                  color="unselected"
                >
                  {key}
                </Button>
                <HStack
                  width={13}
                  height={rowHeight}
                  top={top + rowHeight * (index + 1) + 1}
                  left={left + 17}
                  background="light"
                >
                  {allOptions.map((value, index, array) => {
                    const isPlusMinus =
                      array.length === 3 &&
                      array[1] === '-' &&
                      array[2] === '+';

                    const valueString =
                      value !== undefined
                        ? (value as string).toString()
                        : '[none]';

                    const variant =
                      isPlusMinus && index === 0 ? 'transparent' : undefined;
                    const color =
                      flexPropValue === value ? 'selected' : 'unselected';

                    return (
                      <Button
                        key={`${valueString}-${variant}`}
                        background={variant}
                        color={color}
                        UCID={255}
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
        </>
      )}

      <Button
        top={(flexProps.top ?? 0) - rowHeight - 1}
        left={flexProps.left}
        width={10}
        height={rowHeight}
        color="title"
        align="left"
        UCID={255}
      >
        Flex
      </Button>

      <Flex top={0} left={0} UCID={255} {...flexProps}>
        <Button width={10} height={12}>
          Outer
        </Button>
        <Button width={20} height={8}>
          Flex
        </Button>
        <Button width={8} height={5}>
          Box
        </Button>

        <Flex
          top={1}
          left={1}
          width={30}
          height={15}
          backgroundColor="dark"
          background="light"
          UCID={255}
        >
          <Button width={5} height={12}>
            Inner
          </Button>
          <Button width={10} height={8}>
            Flex
          </Button>
          <Button width={10} height={5}>
            Box
          </Button>
        </Flex>
      </Flex>
    </>
  );
}

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
  'default',
  'title',
  'unselected',
  'selected',
  'ok',
  'cancel',
  'textstring',
  'unavailable',
];

const backgroundOptions: FlexProps['background'][] = [
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
  borderColor: backgroundOptions,
  background: backgroundOptions,
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
