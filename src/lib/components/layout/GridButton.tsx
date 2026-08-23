import type { Node } from '@welefen/grid-layout';
import type { Ref } from 'react';

import type { ButtonElement } from '../../renderer/inSim';
import type { ButtonProps } from '../Button';
import { Button } from '../Button';

export type GridButtonProps = ButtonProps &
  Node['config'] & {
    ref?: Ref<ButtonElement>;
  };

export function GridButton({ ref, ...props }: GridButtonProps) {
  return <Button ref={ref} {...props} />;
}
