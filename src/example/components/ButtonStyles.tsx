import type { IS_BTC } from 'node-insim/packets';
import { ButtonClickFlags, IS_MSL } from 'node-insim/packets';
import type { InSimElements } from 'node-insim-react';
import { Button, useInSim } from 'node-insim-react';
import React, { useCallback, useEffect, useState } from 'react';

export function ButtonStyles() {
  const [isButtonShown, setIsButtonShown] = useState(true);
  const [count, setCount] = useState(0);
  const [width, setWidth] = useState(60);
  const [height, setHeight] = useState(10);
  const [top, setTop] = useState(29);
  const [left, setLeft] = useState(60);
  const [variantId, setVariantId] = useState(0);
  const [alignId, setAlignId] = useState(1);
  const [colorId, setColorId] = useState(0);
  const { inSim } = useInSim();

  const variant = variants[variantId];
  const align = alignments[alignId];
  const color = colors[colorId];

  useEffect(() => {
    inSim.send(new IS_MSL({ Msg: `Count: ${count}` }));
  }, [count]);

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
    </>
  );
}

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
