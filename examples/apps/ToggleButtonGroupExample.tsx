import { useState } from 'react';

import { Button, ToggleButtonGroup } from '../../src';

const options = [
  { label: 'low', value: 1 },
  { label: 'medium', value: 2 },
  { label: 'high', value: 3 },
  { label: 'ultra', value: 4, isDisabled: true },
];

export function ToggleButtonGroupExample() {
  const [selectedOption, setSelectedOption] = useState(options[0]);

  const top = 186;
  const left = 71;
  const width = 24;

  return (
    <>
      <Button
        top={top}
        left={left}
        width={20}
        height={4}
        color="title"
        textAlign="left"
        UCID={255}
      >
        ToggleButtonGroup
      </Button>
      <ToggleButtonGroup
        top={top + 5}
        left={left}
        width={width}
        height={4}
        UCID={255}
        options={options}
        selectedOption={selectedOption}
        onChange={setSelectedOption}
      />
      <ToggleButtonGroup
        isDisabled
        top={top + 9}
        left={left}
        width={width}
        height={4}
        UCID={255}
        options={options}
        selectedOption={selectedOption}
        onChange={setSelectedOption}
      />
    </>
  );
}
