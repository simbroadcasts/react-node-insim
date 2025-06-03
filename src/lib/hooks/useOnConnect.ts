import type { InSim, InSimEvents } from 'node-insim';
import type { IS_VER } from 'node-insim/packets';
import { PacketType } from 'node-insim/packets';
import { useEffect, useRef } from 'react';
import { useInSim } from 'react-node-insim';

import { useInSimContext } from '../internals/InSimContext';

export function useOnConnect(handler: InSimEvents[PacketType.ISP_VER]) {
  const handlerRef = useRef(handler);
  const inSim = useInSim();
  const { connectRequestId } = useInSimContext();

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (packet: IS_VER, inSim: InSim) => {
      if (packet.ReqI === connectRequestId) {
        handlerRef.current(packet, inSim);
      }
    };

    inSim.on(PacketType.ISP_VER, listener);

    return () => {
      inSim.off(PacketType.ISP_VER, listener);
    };
  }, []);
}
