import type { ButtonProps } from 'react-node-insim';
import { Button } from 'react-node-insim';

type Props = Omit<ButtonProps, 'color' | 'onClick' | 'background'> & {
  isOn: boolean;
  onToggle: (value: boolean) => void;
  isDisabled?: boolean;
};

export function ToggleButton({
  isOn,
  onToggle,
  variant = 'light',
  ...props
}: Props) {
  const color = isOn ? selectedColor[variant] : unselectedColor[variant];

  return (
    <Button
      {...props}
      variant={variant}
      color={color}
      onClick={() => onToggle(!isOn)}
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
