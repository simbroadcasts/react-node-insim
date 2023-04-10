import type { InSim } from 'node-insim';
import type { IS_BFN } from 'node-insim/packets';
import { ButtonFunction, PacketType } from 'node-insim/packets';
import type { ReactNode } from 'react';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { log } from './logger';

type InSimContextAPI = {
  inSim: InSim;
  shouldClearAllButtons: boolean;
};

export const InSimContext = createContext<InSimContextAPI | null>(null);

export function useInSimContext(): InSimContextAPI {
  const context = useContext(InSimContext);

  if (!context) {
    throw new Error('useInSim must be called within <RootContext.Provider>.');
  }

  return context;
}

type RootProps = {
  inSim: InSim;
  children: ReactNode;
};

export function InSimContextProvider({ inSim, children }: RootProps) {
  const [shouldClearAllButtons, setShouldClearAllButtons] = useState(false);

  useEffect(() => {
    const bfnListener = (packet: IS_BFN) => {
      if (packet.SubT === ButtonFunction.BFN_USER_CLEAR) {
        log('User cleared all buttons');
        setShouldClearAllButtons(true);
        return;
      }

      if (packet.SubT === ButtonFunction.BFN_REQUEST) {
        log('User requested to show all buttons');
        setShouldClearAllButtons(false);
        return;
      }
    };

    inSim.on(PacketType.ISP_BFN, bfnListener);

    return () => {
      inSim.off(PacketType.ISP_BFN, bfnListener);
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      inSim,
      shouldClearAllButtons,
    }),
    [shouldClearAllButtons],
  );

  return (
    <InSimContext.Provider value={contextValue}>
      {children}
    </InSimContext.Provider>
  );
}
