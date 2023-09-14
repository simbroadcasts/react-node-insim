import type { InSim } from 'node-insim';
import { useMemo } from 'react';

import { useInSimContext } from '../internals/InSimContext';

type InSimHookAPI = InSim;

export function useInSim(): InSimHookAPI {
  const context = useInSimContext();

  return useMemo(() => context.inSim, [context.inSim]);
}
