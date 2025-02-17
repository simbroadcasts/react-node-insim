import type { IS_BTC } from 'node-insim/packets';
import type { ButtonProps } from 'react-node-insim';
import { Button, HStack } from 'react-node-insim';

export type ToggleButtonGroupOption = {
  label: string;
  value: string | number;
  isDisabled?: boolean;
};

type Props<TOption extends ToggleButtonGroupOption> = Omit<
  ButtonProps,
  'color' | 'onClick' | 'background'
> & {
  options: TOption[];
  selectedOption: TOption;
  onChange: (option: TOption) => void;
  isDisabled?: boolean;
};

export function ToggleButtonGroup<TOption extends ToggleButtonGroupOption>({
  options,
  selectedOption,
  onChange,
  top = 0,
  left = 0,
  width = 0,
  variant = 'light',
  isDisabled = false,
  ...props
}: Props<TOption>) {
  const totalWidth = options.length === 0 ? 0 : width / options.length;

  const handleChange = (option: TOption) => (_: IS_BTC) => {
    if (option.value === selectedOption.value) {
      return;
    }

    onChange(option);
  };

  return (
    <HStack top={top} left={left} width={totalWidth}>
      {options.map((option) => {
        const { label, value } = option;
        const isButtonDisabled = isDisabled || option.isDisabled;
        const color =
          value === selectedOption.value ? 'selected' : 'unselected';

        return (
          <Button
            key={value}
            color={color}
            variant={variant}
            onClick={handleChange(option)}
            isDisabled={isButtonDisabled}
            {...props}
          >
            {label}
          </Button>
        );
      })}
    </HStack>
  );
}
