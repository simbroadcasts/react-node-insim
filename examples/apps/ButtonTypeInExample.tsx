import { useState } from 'react';

import { Button, VStack } from '../../src';

export function ButtonTypeInExample() {
  const [firstName, setFirstName] = useState('Martin');
  const [lastName, setLastName] = useState('Kapal');

  const top = 165;
  const left = 93;

  return (
    <>
      <Button
        top={160}
        left={left}
        width={20}
        height={4}
        color="title"
        align="left"
        UCID={255}
      >
        onType event
      </Button>
      <Button
        top={top}
        left={left}
        width={17}
        height={18}
        variant="light"
        UCID={255}
      />
      <VStack top={top + 1} left={left + 1} width={15} height={4} UCID={255}>
        <Button color="unselected" align="left">
          First name
        </Button>
        <Button
          align="left"
          variant="dark"
          color="textstring"
          caption="Enter your first name"
          maxTypeInChars={10}
          onType={(packet) => setFirstName(packet._raw.Text)}
          initializeDialogWithButtonText
        >
          {firstName}
        </Button>
        <Button color="unselected" align="left">
          Last name
        </Button>
        <Button
          align="left"
          variant="dark"
          color="textstring"
          caption="Enter your first name"
          maxTypeInChars={10}
          onType={(packet) => setLastName(packet._raw.Text)}
          initializeDialogWithButtonText
        >
          {lastName}
        </Button>
      </VStack>
    </>
  );
}
