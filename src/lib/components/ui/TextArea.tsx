import type { ButtonProps } from 'react-node-insim';
import { Button } from 'react-node-insim';

type Props = Omit<ButtonProps, 'height'> & {
  rows?: number;
  cols: number;
  rowHeight: number;
};

export function TextArea({
  rows,
  cols,
  rowHeight,
  top,
  left,
  width,
  children,
  align = 'left',
  variant,
  ...props
}: Props) {
  const chunks = split((children ?? '').toString(), cols);
  const length = rows ?? chunks.length;

  return (
    <>
      <Button
        top={top}
        left={left}
        width={width}
        height={length * rowHeight}
        variant={variant}
      />
      {Array.from({ length }).map((_, i) => (
        <Button
          key={i}
          top={(top ?? 0) + i * rowHeight}
          left={left}
          width={width}
          height={rowHeight}
          variant="transparent"
          align={align}
          {...props}
        >
          {chunks[i] ?? ''}
          {i === length - 1 && chunks.length > length ? '...' : ''}
        </Button>
      ))}
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
