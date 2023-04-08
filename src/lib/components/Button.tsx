import React, { ReactElement } from 'react';

import type { BtnProps } from '../elements';
import { useInSim } from '../InSimContext';

export function Button(props: BtnProps) {
  const { shouldClearAllButtons } = useInSim();

  return React.createElement<BtnProps>('btn', {
    shouldClearAllButtons,
    ...props,
  });
}
