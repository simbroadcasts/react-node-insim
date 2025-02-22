import { useState } from 'react';
import { Button } from 'react-node-insim';

const controlsWidth = 40;
const controlsHeight = 5;

export function ButtonOperationsExample() {
  const [width, setWidth] = useState(30);
  const [height, setHeight] = useState(5);
  const [buttons, setButtons] = useState<{ id: string; text: string }[]>([
    generateButton(),
  ]);

  return (
    <>
      <Button
        width={controlsWidth}
        height={controlsHeight}
        variant="light"
        onClick={() => {
          setButtons((prevButtons) =>
            prevButtons.map((button, index) => {
              if (index === 0) {
                return {
                  ...button,
                  text: generateRandomString(6),
                };
              }

              return button;
            }),
          );
        }}
      >
        update text
      </Button>
      <Button
        width={controlsWidth}
        height={controlsHeight}
        variant="light"
        onClick={() => setWidth(width + 1)}
      >
        width +
      </Button>
      <Button
        width={controlsWidth}
        height={controlsHeight}
        variant="light"
        onClick={() => setWidth(width - 1)}
      >
        width -
      </Button>
      <Button
        width={controlsWidth}
        height={controlsHeight}
        variant="light"
        onClick={() => setHeight(height + 1)}
      >
        height +
      </Button>
      <Button
        width={controlsWidth}
        height={controlsHeight}
        variant="light"
        onClick={() => setHeight(height - 1)}
      >
        height -
      </Button>
      <Button
        width={controlsWidth}
        height={controlsHeight}
        variant="light"
        onClick={() =>
          setButtons((prevButtons) => [generateButton(), ...prevButtons])
        }
      >
        prepend
      </Button>
      <Button
        width={controlsWidth}
        height={controlsHeight}
        variant="light"
        onClick={() => {
          setButtons((prevButtons) => [...prevButtons, generateButton()]);
        }}
      >
        append
      </Button>
      <Button
        width={controlsWidth}
        height={controlsHeight}
        variant="light"
        onClick={() => {
          setButtons((prevButtons) => prevButtons.slice(0, -1));
        }}
        marginBottom={4}
      >
        pop
      </Button>
      {buttons.map(({ id, text }) => (
        <Button
          onClick={() => {
            console.log('test');
          }}
          key={id}
          width={width}
          height={height}
          variant="dark"
        >
          {text}
        </Button>
      ))}
    </>
  );
}

function generateRandomString(length: number) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

function generateButton() {
  return { id: generateRandomString(3), text: generateRandomString(6) };
}
