import { IS_MST } from 'node-insim/packets';

import type { ButtonProps } from '../../src';
import { Button, VStack } from '../../src';

export function ButtonExample() {
  const top = 122;
  const left = 95;
  const width = 10;
  const height = 4;

  return (
    <>
      <Button
        top={top}
        left={left}
        width={20}
        height={height}
        color="title"
        align="left"
        UCID={255}
      >
        Button
      </Button>
      {backgroundColors.map((background, backgroundIndex) => (
        <VStack
          key={background}
          top={top + 5}
          left={left + backgroundIndex * width}
          width={width}
          height={height}
          UCID={255}
          background={background}
        >
          {textColors.map((color) => (
            <Button
              key={color}
              color={color}
              align={alignments[backgroundIndex]}
            >
              {color}
            </Button>
          ))}
        </VStack>
      ))}
      <VStack
        top={top + 5}
        left={left + 3 * width}
        width={width}
        height={height}
        UCID={255}
        background="dark"
      >
        <Button
          onClick={(packet, inSim) => {
            inSim.send(
              new IS_MST({ Msg: `Clicked button ID ${packet.ClickID}` }),
            );
          }}
        >
          Click
        </Button>
        <Button
          onType={(packet, inSim) => {
            inSim.send(
              new IS_MST({
                Msg: `Typed in button ID ${packet.ClickID}: ${packet.Text}`,
              }),
            );
          }}
        >
          Type in
        </Button>
      </VStack>
      <VStack
        top={top + 5 + height * 2}
        left={left + 3 * width}
        width={width}
        height={height}
        UCID={255}
      >
        <Button
          variant="light"
          onClick={(packet, inSim) => {
            inSim.send(
              new IS_MST({ Msg: `Clicked button ID ${packet.ClickID}` }),
            );
          }}
        >
          light
        </Button>
        <Button
          variant="light"
          isDisabled
          onClick={(packet, inSim) => {
            inSim.send(
              new IS_MST({ Msg: `Clicked button ID ${packet.ClickID}` }),
            );
          }}
        >
          light
        </Button>
        <Button
          variant="dark"
          onClick={(packet, inSim) => {
            inSim.send(
              new IS_MST({ Msg: `Clicked button ID ${packet.ClickID}` }),
            );
          }}
        >
          dark
        </Button>
        <Button
          variant="dark"
          isDisabled
          onClick={(packet, inSim) => {
            inSim.send(
              new IS_MST({ Msg: `Clicked button ID ${packet.ClickID}` }),
            );
          }}
        >
          dark
        </Button>
      </VStack>
    </>
  );
}

const backgroundColors: Required<ButtonProps['background']>[] = [
  'transparent',
  'light',
  'dark',
];

const alignments: Required<ButtonProps['align']>[] = [
  'left',
  'center',
  'right',
];

const textColors: Required<ButtonProps['color']>[] = [
  'default',
  'title',
  'unselected',
  'selected',
  'ok',
  'cancel',
  'textstring',
  'unavailable',
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
];
