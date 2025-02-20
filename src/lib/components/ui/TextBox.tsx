import { useState } from 'react';
import type { ButtonProps } from 'react-node-insim';
import { Button_OLD } from 'react-node-insim';

type Props = Omit<ButtonProps, 'height'> & {
  rows?: number;

  /** Maximum number of characters per row */
  cols: number;

  /** Height of each row of text */
  rowHeight: number;
};

export function TextBox({
  rows: rowsProp,
  cols,
  rowHeight,
  top = 0,
  left = 0,
  width = 0,
  children,
  align = 'left',
  background,
  color,
  variant,
  UCID,
  ...props
}: Props) {
  const [scrollPosition, setScrollPosition] = useState(0);

  const chunks = split((children ?? '').toString(), cols);
  const rows = rowsProp ?? chunks.length;

  const isScrollbarVisible = rows && chunks.length > rows;
  const canScrollUp = scrollPosition > 0;
  const canScrollDown = scrollPosition + rows <= chunks.length - 1;

  const commonProps: ButtonProps = {
    UCID,
  };

  const scrollbarWidth = Math.round(rowHeight * 0.75);
  const textAreaWidth = isScrollbarVisible ? width - scrollbarWidth : width;

  const textAreaHeight = rows * rowHeight;
  const scrollbarHeightWithButtons = textAreaHeight - 2 * rowHeight;
  const scrollbarHeight = Math.floor(
    scrollbarHeightWithButtons * (rows / chunks.length),
  );
  const scrollButtonHeight = rows === 1 ? Math.round(rowHeight / 2) : rowHeight;
  const scrollbarLeft = left + textAreaWidth;

  return (
    <>
      <Button_OLD
        top={top}
        left={left}
        width={textAreaWidth}
        height={textAreaHeight}
        background={background}
        variant={variant}
        {...commonProps}
      />
      {Array.from({ length: rows }).map((_, i) => (
        <Button_OLD
          key={i}
          top={top + i * rowHeight}
          left={left}
          width={textAreaWidth}
          height={rowHeight}
          align={align}
          variant={variant}
          color={color}
          background="transparent"
          {...props}
          {...commonProps}
        >
          {chunks[i + scrollPosition] ?? ''}
          {i === rows - 1 && canScrollDown ? '...' : ''}
        </Button_OLD>
      ))}
      {isScrollbarVisible && (
        <>
          <Button_OLD
            top={top}
            left={scrollbarLeft}
            width={scrollbarWidth}
            height={scrollButtonHeight}
            variant={variant}
            background={background}
            color={color}
            isDisabled={!canScrollUp}
            onClick={() => {
              if (canScrollUp) {
                setScrollPosition(scrollPosition - 1);
              }
            }}
            {...commonProps}
          >
            ▲
          </Button_OLD>
          {rows > 2 && (
            <>
              <Button_OLD
                top={
                  top + rowHeight + (scrollPosition / rows) * scrollbarHeight
                }
                left={scrollbarLeft}
                width={scrollbarWidth}
                height={scrollbarHeight}
                variant={variant}
                background={background}
                {...commonProps}
              />
            </>
          )}
          <Button_OLD
            top={
              top +
              textAreaHeight -
              (rows === 1 ? Math.round(rowHeight / 2) : rowHeight)
            }
            left={scrollbarLeft}
            width={scrollbarWidth}
            height={scrollButtonHeight}
            variant={variant}
            background={background}
            color={color}
            isDisabled={!canScrollDown}
            onClick={() => {
              if (canScrollDown) {
                setScrollPosition(scrollPosition + 1);
              }
            }}
            {...commonProps}
          >
            ▼
          </Button_OLD>
        </>
      )}
    </>
  );
}

function split(text: string, maxChunkLength: number) {
  const words = text.split(' ');
  const chunks = [];
  let currentChunk = '';

  for (const word of words) {
    if (currentChunk.length + word.length + 1 <= maxChunkLength) {
      if (currentChunk.length > 0) {
        currentChunk += ' ';
      }
      currentChunk += word;
    } else {
      chunks.push(currentChunk);
      currentChunk = word;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}
