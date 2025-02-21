import { useState } from 'react';

import { Button, HStack, TextBox } from '../../src';

export function TextBoxExample() {
  const [rows, setRows] = useState<number | undefined>(4);
  const [cols, setCols] = useState(20);
  const [rowHeight, setRowHeight] = useState(4);

  const top = 157;
  const left = 128;

  return (
    <>
      <HStack top={top} left={left} height={4} UCID={255}>
        <Button width={8} color="title" textAlign="left">
          TextBox
        </Button>
        <Button
          width={8}
          variant="light"
          onType={(packet) => {
            if (!packet.Text) {
              setRows(undefined);
              return;
            }

            const number = parseInt(packet.Text, 10);

            if (isNaN(number) || number < 1) {
              return;
            }

            setRows(number);
          }}
        >
          Rows: {rows ?? '-'}
        </Button>
        <Button
          width={8}
          variant="light"
          onType={(packet) => {
            const number = parseInt(packet.Text, 10);

            if (isNaN(number) || number < 1) {
              return;
            }

            setCols(number);
          }}
        >
          Cols: {cols}
        </Button>
        <Button
          width={12}
          variant="light"
          onType={(packet) => {
            const number = parseInt(packet.Text, 10);

            if (isNaN(number) || number < 1) {
              return;
            }

            setRowHeight(number);
          }}
        >
          Row height: {rowHeight}
        </Button>
      </HStack>
      <TextBox
        top={top + 5}
        left={left}
        cols={cols}
        rows={rows}
        width={20}
        rowHeight={rowHeight}
        UCID={255}
        variant="light"
      >
        Hello world this is a text area lorem ipsum dolor sit amet consectetur
        adipisicing elitrea lorem ipsum dolor sit amet consectetur adipisicing
        elit
      </TextBox>
    </>
  );
}
