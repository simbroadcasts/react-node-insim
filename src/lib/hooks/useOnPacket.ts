import type { InSim, InSimPacketEvents } from 'node-insim';
import type { InSimPacketInstance, PacketType } from 'node-insim/packets';
import { useEffect, useRef } from 'react';
import { useInSim } from 'react-node-insim';

export function useOnPacket<T extends keyof InSimPacketEvents>(
  event: T,
  handler: InSimPacketEvents[T],
) {
  const handlerRef = useRef(handler);
  const inSim = useInSim();

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (
      packet: InSimPacketInstance<PacketType>,
      inSim: InSim,
    ) => {
      handlerRef.current(packet as never, inSim);
    };

    inSim.on(event, listener);

    return () => {
      inSim.off(event, listener);
    };
  }, []);
}
