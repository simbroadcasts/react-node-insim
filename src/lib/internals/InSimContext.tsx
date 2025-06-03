import type { InSim } from 'node-insim';
import type { IS_BFN, IS_VER } from 'node-insim/packets';
import { ButtonFunction, PacketType } from 'node-insim/packets';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { log } from './logger';

type InSimContextAPI = {
  inSim: InSim;
  isConnected: boolean;
  UCIDsWithClearedButtons: number[];
};

/** @internal */
export const InSimContext = createContext<InSimContextAPI | null>(null);

/** @internal */
export function useInSimContext(): InSimContextAPI {
  const context = useContext(InSimContext);

  if (!context) {
    throw new Error('useInSim must be called within <InSimContext.Provider>.');
  }

  return context;
}

type RootProps = {
  inSim: InSim;
  children: ReactNode;
  connectRequestId: number;
};

/** @internal */
export function InSimContextProvider({
  inSim,
  children,
  connectRequestId,
}: RootProps) {
  const [UCIDsWithClearedButtons, setUCIDsWithClearedButtons] = useState<
    number[]
  >([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const bfnListener = (packet: IS_BFN) => {
      if (packet.SubT === ButtonFunction.BFN_USER_CLEAR) {
        log('User cleared all buttons');
        setUCIDsWithClearedButtons((prevState) => [...prevState, packet.UCID]);
        return;
      }

      if (packet.SubT === ButtonFunction.BFN_REQUEST) {
        log('User requested to show all buttons');
        setUCIDsWithClearedButtons((prevState) =>
          prevState.filter((ucid) => ucid !== packet.SubT),
        );
        return;
      }
    };

    inSim.on(PacketType.ISP_BFN, bfnListener);

    return () => {
      inSim.off(PacketType.ISP_BFN, bfnListener);
    };
  }, []);

  useEffect(() => {
    const onVersion = (packet: IS_VER) => {
      if (packet.ReqI === connectRequestId) {
        setIsConnected(true);
      }
    };

    inSim.on(PacketType.ISP_VER, onVersion);

    return () => {
      inSim.off(PacketType.ISP_VER, onVersion);
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      inSim,
      isConnected,
      UCIDsWithClearedButtons,
    }),
    [inSim, isConnected, UCIDsWithClearedButtons],
  );

  return (
    <InSimContext.Provider value={contextValue}>
      {children}
    </InSimContext.Provider>
  );
}
