import type { InSim } from 'node-insim';
import type { InSimPacketInstance } from 'node-insim/packets';
import { ButtonFunction, PacketType } from 'node-insim/packets';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { log } from './logger';

type InSimContextAPI = {
  inSim: InSim;
  connectRequestId: number;
  isConnected: boolean;
  clearedUCIDs: ReadonlySet<number>;
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
  const [clearedUCIDs, setClearedUCIDs] = useState<Set<number>>(
    () => new Set(),
  );
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const bfnListener = (packet: InSimPacketInstance<PacketType.ISP_BFN>) => {
      if (packet.SubT === ButtonFunction.BFN_USER_CLEAR) {
        log(`User cleared all buttons for UCID ${packet.UCID}`);
        setClearedUCIDs((prev) => {
          if (prev.has(packet.UCID)) {
            return prev;
          }

          const next = new Set(prev);
          next.add(packet.UCID);
          return next;
        });
        return;
      }

      if (packet.SubT === ButtonFunction.BFN_REQUEST) {
        log(`User requested to show all buttons for UCID ${packet.UCID}`);
        setClearedUCIDs((prev) => {
          if (!prev.has(packet.UCID)) {
            return prev;
          }

          const next = new Set(prev);
          next.delete(packet.UCID);
          return next;
        });
        return;
      }
    };

    inSim.on(PacketType.ISP_BFN, bfnListener);

    return () => {
      inSim.off(PacketType.ISP_BFN, bfnListener);
    };
  }, []);

  useEffect(() => {
    const cnlListener = (packet: InSimPacketInstance<PacketType.ISP_CNL>) => {
      setClearedUCIDs((prev) => {
        if (!prev.has(packet.UCID)) {
          return prev;
        }

        const next = new Set(prev);
        next.delete(packet.UCID);
        return next;
      });
    };

    inSim.on(PacketType.ISP_CNL, cnlListener);

    return () => {
      inSim.off(PacketType.ISP_CNL, cnlListener);
    };
  }, []);

  useEffect(() => {
    const onVersion = (packet: InSimPacketInstance<PacketType.ISP_VER>) => {
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
      connectRequestId,
      isConnected,
      clearedUCIDs,
    }),
    [inSim, isConnected, connectRequestId, clearedUCIDs],
  );

  return (
    <InSimContext.Provider value={contextValue}>
      {children}
    </InSimContext.Provider>
  );
}
