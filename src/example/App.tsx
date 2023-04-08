import type { IS_BTC } from 'node-insim/packets';
import { ButtonClickFlags } from 'node-insim/packets';
import React, { useCallback, useEffect, useState } from 'react';

import type { InSimElements } from '../lib/JSX';

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
  const [top, setTop] = useState(20);
  const [left, setLeft] = useState(40);
  const [variantId, setVariantId] = useState(0);
  const [alignId, setAlignId] = useState(1);
  const [colorId, setColorId] = useState(0);

  const [typeIn, setTypeIn] = useState('');

  const [buttonCount, setButtonCount] = useState(0);

  const variant = variants[variantId];
  const align = alignments[alignId];
  const color = colors[colorId];

  useEffect(() => {
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
        <btn
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
        </btn>
      )}

      <btn
        top={40}
        left={55}
        width={45}
        height={10}
        variant="dark"
        onClick={() => setIsButtonShown((isShown) => !isShown)}
      >
        {isButtonShown ? 'Hide' : 'Show'} button above
      </btn>

      <btn top={50} left={40} width={15} height={10} align="right">
        Top
      </btn>
      <btn
        top={50}
        left={55}
        width={10}
        height={10}
        variant="dark"
        onClick={() => {
          console.log('decrement top', { isShown: isButtonShown });
          setTop((prevTop) => prevTop - 1);
        }}
      >
        -
      </btn>
      <btn
        top={50}
        left={65}
        width={10}
        height={10}
        variant="dark"
        onClick={() => setTop((prevTop) => prevTop + 1)}
      >
        +
      </btn>
      <btn top={60} left={40} width={15} height={10} align="right">
        Left
      </btn>
      <btn
        top={60}
        left={55}
        width={10}
        height={10}
        variant="dark"
        onClick={() => setLeft((prevLeft) => prevLeft - 1)}
      >
        -
      </btn>
      <btn
        top={60}
        left={65}
        width={10}
        height={10}
        variant="dark"
        onClick={() => setLeft((prevLeft) => prevLeft + 1)}
      >
        +
      </btn>
      <btn top={70} left={40} width={15} height={10} align="right">
        Width
      </btn>
      <btn
        top={70}
        left={55}
        width={10}
        height={10}
        variant="dark"
        onClick={() => setWidth((prevWidth) => prevWidth - 1)}
      >
        -
      </btn>
      <btn
        top={70}
        left={65}
        width={10}
        height={10}
        variant="dark"
        onClick={() => setWidth((prevWidth) => prevWidth + 1)}
      >
        +
      </btn>
      <btn top={80} left={40} width={15} height={10} align="right">
        Height
      </btn>
      <btn
        top={80}
        left={55}
        width={10}
        height={10}
        variant="dark"
        onClick={() => setHeight((prevHeight) => prevHeight - 1)}
      >
        -
      </btn>
      <btn
        top={80}
        left={65}
        width={10}
        height={10}
        variant="dark"
        onClick={() => setHeight((prevHeight) => prevHeight + 1)}
      >
        +
      </btn>
      <btn top={90} left={40} width={15} height={10} align="right">
        Variant
      </btn>
      {variants.map((variant, id) => {
        const width = 20;
        return (
          <btn
            key={id}
            top={90}
            left={55 + id * width}
            width={width}
            height={10}
            variant="dark"
            onClick={() => setVariantId(id)}
          >
            {variant ?? 'undefined'}
          </btn>
        );
      })}
      <btn top={100} left={40} width={15} height={10} align="right">
        Align
      </btn>
      {alignments.map((align, id) => {
        const width = 20;
        return (
          <btn
            key={id}
            top={100}
            left={55 + id * width}
            width={width}
            height={10}
            variant="dark"
            onClick={() => setAlignId(id)}
          >
            {align ?? 'undefined'}
          </btn>
        );
      })}
      <btn top={110} left={40} width={15} height={10} align="right">
        Color
      </btn>
      {colors.map((color, id) => {
        const width = 12;
        return (
          <btn
            key={id}
            top={113}
            left={55 + id * width}
            width={width}
            height={5}
            variant="dark"
            onClick={() => setColorId(id)}
          >
            {color ?? 'undefined'}
          </btn>
        );
      })}

      <btn top={128} left={25} width={30} height={10} align="right">
        Add buttons
      </btn>
      <btn
        top={128}
        left={55}
        width={10}
        height={10}
        variant="dark"
        onClick={() =>
          setButtonCount((prevCount) => (prevCount > 0 ? prevCount - 1 : 0))
        }
      >
        -
      </btn>
      <btn top={128} left={65} width={10} height={10}>
        {buttonCount}
      </btn>
      <btn
        top={128}
        left={75}
        width={10}
        height={10}
        variant="dark"
        onClick={() => setButtonCount((prevCount) => prevCount + 1)}
      >
        +
      </btn>

      <btn
        top={145}
        left={55}
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
      </btn>
      <btn
        top={145}
        left={85}
        width={30}
        height={10}
        variant="light"
        color="unselected"
      >
        {typeIn}
      </btn>

      {Array(buttonCount)
        .fill(0)
        .map((_, index) => (
          <btn key={index} top={140} left={index * 4} width={4} height={5}>
            {index}
          </btn>
        ))}
    </>
  );
}
