import type { IS_BTC } from 'node-insim/packets';
import { ButtonClickFlags, IS_MSL } from 'node-insim/packets';
import type { InSimElements } from 'node-insim-react';
import { Button, useInSim } from 'node-insim-react';
import React, { useCallback, useEffect, useState } from 'react';

import { Layouts } from './components';

const variants: InSimElements['btn']['variant'][] = [
  'dark',
  'light',
  'transparent',
];

const alignments: InSimElements['btn']['align'][] = ['left', 'center', 'right'];

const colors: InSimElements['btn']['color'][] = [
  'lightgrey',
  'title',
  'unselected',
  'selected',
  'ok',
  'cancel',
  'textstring',
  'unavailable',
];

export function App() {
  const [isButtonShown, setIsButtonShown] = useState(true);
  const [count, setCount] = useState(0);
  const [width, setWidth] = useState(60);
  const [height, setHeight] = useState(10);
  const [top, setTop] = useState(29);
  const [left, setLeft] = useState(60);
  const [variantId, setVariantId] = useState(0);
  const [alignId, setAlignId] = useState(1);
  const [colorId, setColorId] = useState(0);

  const [typeIn, setTypeIn] = useState('');

  const [buttonCount, setButtonCount] = useState(0);

  const variant = variants[variantId];
  const align = alignments[alignId];
  const color = colors[colorId];

  const { inSim } = useInSim();

  useEffect(() => {
    inSim.send(new IS_MSL({ Msg: `Count: ${count}` }));
  }, [count]);

  useEffect(() => {
    inSim.send(new IS_MSL({ Msg: 'App mounted' }));

    setInterval(() => {
      setCount((prevCount) => prevCount + 1);
    }, 1000);
  }, []);

  const testButtonClick = useCallback((packet: IS_BTC) => {
    const isRightClick = packet.CFlags & ButtonClickFlags.ISB_RMB;
    setCount((prevCount) => prevCount + (isRightClick ? 10 : 1));
    console.log(
      `${isRightClick ? 'right' : 'left'}-clicked button ID`,
      packet.ClickID,
    );
  }, []);

  return (
    <>
      {isButtonShown && (
        <Button
          UCID={255}
          onClick={testButtonClick}
          top={top}
          left={left}
          width={width}
          height={height}
          variant={variant}
          align={align}
          color={color}
        >
          Click to increment: {count}
        </Button>
      )}

      <Button
        top={40}
        left={60}
        width={45}
        height={10}
        variant="dark"
        onClick={() => setIsButtonShown((isShown) => !isShown)}
      >
        {isButtonShown ? 'Hide' : 'Show'} button above
      </Button>

      <Button top={50} left={45} width={15} height={10} align="right">
        Top
      </Button>
      <Button
        top={50}
        left={60}
        width={10}
        height={10}
        variant="dark"
        onClick={() => {
          console.log('decrement top', { isShown: isButtonShown });
          setTop((prevTop) => prevTop - 1);
        }}
      >
        -
      </Button>
      <Button
        top={50}
        left={70}
        width={10}
        height={10}
        variant="dark"
        onClick={() => setTop((prevTop) => prevTop + 1)}
      >
        +
      </Button>
      <Button top={60} left={45} width={15} height={10} align="right">
        Left
      </Button>
      <Button
        top={60}
        left={60}
        width={10}
        height={10}
        variant="dark"
        onClick={() => setLeft((prevLeft) => prevLeft - 1)}
      >
        -
      </Button>
      <Button
        top={60}
        left={70}
        width={10}
        height={10}
        variant="dark"
        onClick={() => setLeft((prevLeft) => prevLeft + 1)}
      >
        +
      </Button>
      <Button top={70} left={45} width={15} height={10} align="right">
        Width
      </Button>
      <Button
        top={70}
        left={60}
        width={10}
        height={10}
        variant="dark"
        onClick={() => setWidth((prevWidth) => prevWidth - 1)}
      >
        -
      </Button>
      <Button
        top={70}
        left={70}
        width={10}
        height={10}
        variant="dark"
        onClick={() => setWidth((prevWidth) => prevWidth + 1)}
      >
        +
      </Button>
      <Button top={80} left={45} width={15} height={10} align="right">
        Height
      </Button>
      <Button
        top={80}
        left={60}
        width={10}
        height={10}
        variant="dark"
        onClick={() => setHeight((prevHeight) => prevHeight - 1)}
      >
        -
      </Button>
      <Button
        top={80}
        left={70}
        width={10}
        height={10}
        variant="dark"
        onClick={() => setHeight((prevHeight) => prevHeight + 1)}
      >
        +
      </Button>
      <Button top={90} left={45} width={15} height={10} align="right">
        Variant
      </Button>
      {variants.map((variant, id) => {
        const width = 20;
        return (
          <Button
            key={id}
            top={90}
            left={60 + id * width}
            width={width}
            height={10}
            variant="dark"
            onClick={() => setVariantId(id)}
          >
            {variant ?? 'undefined'}
          </Button>
        );
      })}
      <Button top={100} left={45} width={15} height={10} align="right">
        Align
      </Button>
      {alignments.map((align, id) => {
        const width = 20;
        return (
          <Button
            key={id}
            top={100}
            left={60 + id * width}
            width={width}
            height={10}
            variant="dark"
            onClick={() => setAlignId(id)}
          >
            {align ?? 'undefined'}
          </Button>
        );
      })}
      <Button top={110} left={45} width={15} height={10} align="right">
        Color
      </Button>
      {colors.map((color, id) => {
        const width = 12;
        return (
          <Button
            key={id}
            top={113}
            left={60 + id * width}
            width={width}
            height={5}
            variant="dark"
            onClick={() => setColorId(id)}
          >
            {color ?? 'undefined'}
          </Button>
        );
      })}

      <Button top={128} left={25} width={30} height={10} align="right">
        Add buttons
      </Button>
      <Button
        top={128}
        left={60}
        width={10}
        height={10}
        variant="dark"
        onClick={() =>
          setButtonCount((prevCount) => (prevCount > 0 ? prevCount - 1 : 0))
        }
      >
        -
      </Button>
      <Button top={128} left={70} width={10} height={10}>
        {buttonCount}
      </Button>
      <Button
        top={128}
        left={80}
        width={10}
        height={10}
        variant="dark"
        onClick={() => setButtonCount((prevCount) => prevCount + 1)}
      >
        +
      </Button>

      <Button
        top={145}
        left={60}
        width={30}
        height={10}
        variant="dark"
        maxTypeInChars={10}
        onType={(packet) => {
          console.log('Typed in button ID', packet.ClickID, `: ${packet.Text}`);
          setTypeIn(packet._raw.Text);
        }}
      >
        Open dialog
      </Button>
      <Button
        top={145}
        left={90}
        width={30}
        height={10}
        variant="light"
        color="unselected"
      >
        {typeIn}
      </Button>

      {Array(buttonCount)
        .fill(0)
        .map((_, index) => (
          <Button key={index} top={140} left={index * 4} width={4} height={5}>
            {index}
          </Button>
        ))}

      <Layouts />
    </>
  );
}
