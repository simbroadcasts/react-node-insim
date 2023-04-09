import { Button, Flex, HStack } from 'node-insim-react';
import React, { Fragment, useState } from 'react';

import type { FlexProps } from '../../lib/components/Flex';

const alignContentOptions: FlexProps['alignContent'][] = [
  'left',
  'center',
  'right',
  'stretch',
  'auto',
  'baseline',
  'space-between',
  'space-around',
];

const alignItemsOptions: FlexProps['alignItems'][] = [
  'left',
  'center',
  'right',
  'stretch',
  'auto',
  'baseline',
];

const backgroundColorOptions: FlexProps['backgroundColor'][] = [
  'light',
  'dark',
];

const directionOptions: FlexProps['direction'][] = [
  'row',
  'row-reverse',
  'column',
  'column-reverse',
];

const justifyContentOptions: FlexProps['justifyContent'][] = [
  'left',
  'center',
  'right',
  'space-evenly',
  'space-around',
  'space-between',
];

const wrapOptions: FlexProps['wrap'][] = ['no-wrap', 'wrap', 'wrap-reverse'];

const rows: Partial<Record<keyof FlexProps, unknown[]>> = {
  alignContent: alignContentOptions,
  alignItems: alignItemsOptions,
  backgroundColor: backgroundColorOptions,
  direction: directionOptions,
  // color: undefined,
  // height: 0,
  justifyContent: justifyContentOptions,
  // left: 0,
  margin: [0, 5, 10],
  marginBottom: [0, 5, 10],
  marginHorizontal: [0, 5, 10],
  marginLeft: [0, 5, 10],
  marginRight: [0, 5, 10],
  marginTop: [0, 5, 10],
  marginVertical: [0, 5, 10],
  padding: [0, 5, 10],
  paddingBottom: [0, 5, 10],
  paddingHorizontal: [0, 5, 10],
  paddingLeft: [0, 5, 10],
  paddingRight: [0, 5, 10],
  paddingTop: [0, 5, 10],
  paddingVertical: [0, 5, 10],
  // top: 0,
  // variant: undefined,
  // width: 0,
  wrap: wrapOptions,
};

export function Layouts() {
  const [flexProps, setFlexProps] = useState<Partial<FlexProps>>({});

  return (
    <>
      {Object.entries(rows).map(([key, options], index) => (
        <Fragment key={key}>
          <Button
            width={20}
            height={5}
            top={5 + 5 * index}
            left={5}
            align="left"
          >
            {key}
          </Button>
          <HStack
            width={15}
            height={5}
            top={5 + 5 * index}
            left={25}
            variant="light"
          >
            {[undefined, ...options].map((value) => {
              const valueString =
                value !== undefined ? (value as string).toString() : '[none]';

              return (
                <Button
                  color={
                    flexProps[key as keyof FlexProps] === value
                      ? 'selected'
                      : 'unselected'
                  }
                  key={valueString}
                  onClick={() =>
                    setFlexProps((prevState) => ({
                      ...prevState,
                      [key]: value,
                    }))
                  }
                >
                  {valueString}
                </Button>
              );
            })}
          </HStack>
        </Fragment>
      ))}

      <Flex
        top={120}
        left={80}
        width={80}
        height={40}
        color="title"
        {...flexProps}
      >
        <Button width={20} height={10} variant="dark">
          Hello
        </Button>
        <Button width={30} height={8} variant="dark">
          Flex
        </Button>
        <Button width={8} height={5} variant="dark">
          Box
        </Button>
      </Flex>
    </>
  );
}
