import { useState } from 'react';

import { Button_OLD, HStack, VStack } from '../../src';

export function StackExample() {
  const [gap, setGap] = useState(0);
  const [height, setHeight] = useState(4);

  const top = 157;
  const left = 33;

  return (
    <>
      <HStack top={top} left={left} height={4} UCID={255}>
        <Button_OLD width={7} color="title" align="left">
          VStack
        </Button_OLD>
        <Button_OLD
          width={7}
          variant="light"
          onType={(packet) => {
            const number = parseInt(packet.Text, 10);

            if (isNaN(number)) {
              return;
            }

            setGap(number);
          }}
        >
          Gap: {gap}
        </Button_OLD>
        <Button_OLD
          width={8}
          variant="light"
          onType={(packet) => {
            const number = parseInt(packet.Text, 10);

            if (isNaN(number) || number < 1) {
              return;
            }

            setHeight(number);
          }}
        >
          Height: {height}
        </Button_OLD>
      </HStack>
      <VStack
        top={top + 5}
        left={left}
        width={16}
        height={height}
        background="dark"
        UCID={255}
        gap={gap}
      >
        <Button_OLD>Stacked button 1</Button_OLD>
        <Button_OLD>Stacked button 2</Button_OLD>
        <Button_OLD>Stacked button 3</Button_OLD>
        <Button_OLD>Stacked button 4</Button_OLD>
      </VStack>
      <VStack
        top={top + 5}
        left={left + 16}
        width={20}
        background="dark"
        UCID={255}
      >
        <Button_OLD height={4}>Height: 4</Button_OLD>
        <Button_OLD height={10}>Height: 10</Button_OLD>
        <Button_OLD height={14}>Height: 14</Button_OLD>
        <Button_OLD height={6}>Height: 6</Button_OLD>
      </VStack>
      <Button_OLD
        top={top}
        left={left + 38}
        width={20}
        height={4}
        color="title"
        align="left"
        UCID={255}
      >
        HStack
      </Button_OLD>
      <HStack
        top={top + 5}
        left={left + 38}
        width={3}
        height={4}
        background="dark"
        UCID={255}
      >
        <Button_OLD>1</Button_OLD>
        <Button_OLD>2</Button_OLD>
        <Button_OLD>3</Button_OLD>
        <Button_OLD>4</Button_OLD>
        <Button_OLD>5</Button_OLD>
        <Button_OLD>6</Button_OLD>
      </HStack>
      <HStack
        top={top + 10}
        left={left + 38}
        width={4}
        height={4}
        background="dark"
        UCID={255}
      >
        <Button_OLD width={3}>3</Button_OLD>
        <Button_OLD width={5}>5</Button_OLD>
        <Button_OLD width={9}>9</Button_OLD>
        <Button_OLD width={4}>4</Button_OLD>
      </HStack>
    </>
  );
}
