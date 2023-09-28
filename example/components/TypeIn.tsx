import { useState } from 'react';

import { Button } from '../../src';

export function TypeIn() {
  const [typeIn, setTypeIn] = useState('');

  return (
    <>
      <Button top={40} left={40} width={30} height={10} UCID={255}>
        Name
      </Button>
      <Button
        top={40}
        left={70}
        width={30}
        height={10}
        UCID={255}
        variant="light"
        color="unselected"
        caption="Enter your name"
        maxTypeInChars={10}
        onType={(packet) => {
          console.log('Typed in button ID', packet.ClickID, `: ${packet.Text}`);
          setTypeIn(packet._raw.Text);
        }}
      >
        {typeIn}
      </Button>
    </>
  );
}
