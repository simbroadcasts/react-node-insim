import type { Node } from '@welefen/grid-layout';
import type { ForwardedRef } from 'react';
import { forwardRef } from 'react';

import type { ButtonElement } from '../../renderer/inSim';
import type { ButtonProps } from '../Button';
import { Button } from '../Button';

export type GridButtonProps = ButtonProps & Node['config'];

export const GridButton = forwardRef(function GridButton(
  props: GridButtonProps,
  ref: ForwardedRef<ButtonElement>,
) {
  return <Button ref={ref} {...props} />;
});
