import type { InSim } from 'node-insim';

import { useInSimContext } from '../InSimContext';

type InSimHookAPI = InSim;

export function useInSim(): InSimHookAPI {
  const context = useInSimContext();

  return context.inSim;
}