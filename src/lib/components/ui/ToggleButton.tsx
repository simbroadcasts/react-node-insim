import type { ButtonProps } from 'react-node-insim';
import { Button } from 'react-node-insim';

type Props = Omit<ButtonProps, 'color' | 'onClick' | 'variant'> & {
  isOn: boolean;
  onToggle: (value: boolean) => void;
  variant?: Exclude<ButtonProps['variant'], 'transparent'>;
  isDisabled?: boolean;
};

export function ToggleButton({
  isOn,
  onToggle,
  variant = 'light',
  isDisabled = false,
  ...props
}: Props) {
  let color: Required<ButtonProps>['color'];

  if (isDisabled) {
    color = 'unavailable';
  } else {
    color = isOn ? selectedColor[variant] : unselectedColor[variant];
  }

  return (
    <Button
      {...props}
      variant={variant}
      color={color}
      onClick={isDisabled ? undefined : () => onToggle(!isOn)}
    />
  );
}

const unselectedColor: Record<
  Required<Props>['variant'],
  Required<ButtonProps>['color']
> = {
  light: 'unselected',
  dark: 'lightgrey',
};

const selectedColor: Record<
  Required<Props>['variant'],
  Required<ButtonProps>['color']
> = {
  light: 'selected',
  dark: 'selected',
};
