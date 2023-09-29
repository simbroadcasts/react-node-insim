import { useState } from 'react';

import { Button, HStack, VStack } from '../../src';

export function StackExample() {
  const [gap, setGap] = useState(0);
  const [height, setHeight] = useState(4);

  const top = 160;
  const left = 33;

  return (
    <>
      <HStack top={top} left={left} height={4} UCID={255}>
        <Button width={7} color="title" align="left">
          VStack
        </Button>
        <Button
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
        </Button>
        <Button
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
        </Button>
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
        <Button>Stacked button 1</Button>
        <Button>Stacked button 2</Button>
        <Button>Stacked button 3</Button>
        <Button>Stacked button 4</Button>
      </VStack>
      <VStack
        top={top + 5}
        left={left + 16}
        width={20}
        background="dark"
        UCID={255}
      >
        <Button height={4}>Height: 4</Button>
        <Button height={10}>Height: 10</Button>
        <Button height={14}>Height: 14</Button>
        <Button height={6}>Height: 6</Button>
      </VStack>
      <Button
        top={top}
        left={left + 38}
        width={20}
        height={4}
        color="title"
        align="left"
        UCID={255}
      >
        HStack
      </Button>
      <HStack
        top={top + 5}
        left={left + 38}
        width={3}
        height={4}
        background="dark"
        UCID={255}
      >
        <Button>1</Button>
        <Button>2</Button>
        <Button>3</Button>
        <Button>4</Button>
        <Button>5</Button>
        <Button>6</Button>
      </HStack>
      <HStack
        top={top + 10}
        left={left + 38}
        width={4}
        height={4}
        background="dark"
        UCID={255}
      >
        <Button width={3}>3</Button>
        <Button width={5}>5</Button>
        <Button width={9}>9</Button>
        <Button width={4}>4</Button>
      </HStack>
    </>
  );
}
