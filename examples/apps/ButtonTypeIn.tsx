import { useState } from 'react';

import { Button, VStack } from '../../src';

export function ButtonTypeIn() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  return (
    <VStack top={170} left={170} width={20} height={4} UCID={255}>
      <Button color="title" align="left">
        First name
      </Button>
      <Button
        align="left"
        variant="light"
        color="unselected"
        caption="Enter your first name"
        maxTypeInChars={10}
        onType={(packet) => setFirstName(packet._raw.Text)}
      >
        {firstName}
      </Button>
      <Button color="title" align="left">
        Last name
      </Button>
      <Button
        align="left"
        variant="light"
        color="unselected"
        caption="Enter your first name"
        maxTypeInChars={10}
        onType={(packet) => setLastName(packet._raw.Text)}
      >
        {lastName}
      </Button>
    </VStack>
  );
}
