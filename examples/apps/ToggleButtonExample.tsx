import { useState } from 'react';

import { Button, ToggleButton } from '../../src';

export function ToggleButtonExample() {
  const [isOnLight, setIsOnLight] = useState(false);
  const [isOnDark, setIsOnDark] = useState(false);

  const top = 160;
  const left = 160;
  const width = 6;

  return (
    <>
      <Button
        top={top}
        left={left}
        width={20}
        height={4}
        color="title"
        align="left"
        UCID={255}
      >
        ToggleButton
      </Button>
      <ToggleButton
        top={top + 5}
        left={left}
        width={width}
        height={4}
        UCID={255}
        isOn={isOnLight}
        onToggle={setIsOnLight}
      >
        show
      </ToggleButton>
      <ToggleButton
        variant="dark"
        top={top + 9}
        left={left}
        width={width}
        height={4}
        UCID={255}
        isOn={isOnDark}
        onToggle={setIsOnDark}
      >
        show
      </ToggleButton>
      <ToggleButton
        isDisabled
        top={top + 5}
        left={left + width}
        width={width}
        height={4}
        UCID={255}
        isOn={isOnLight}
        onToggle={setIsOnLight}
      >
        show
      </ToggleButton>
      <ToggleButton
        isDisabled
        variant="dark"
        top={top + 9}
        left={left + width}
        width={width}
        height={4}
        UCID={255}
        isOn={isOnDark}
        onToggle={setIsOnDark}
      >
        show
      </ToggleButton>
    </>
  );
}
