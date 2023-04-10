import type {
  InSim as NodeInSim,
  InSimEvents,
  InSimPacketEvents,
} from 'node-insim';
import type { IS_CPP, IS_MSO, IS_STA, IS_VER } from 'node-insim/packets';
import { PacketType } from 'node-insim/packets';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { useInSim } from '../hooks';

type InSimProps = {
  children: ReactNode;
  onCameraPosition?: (packet: IS_CPP) => void;
  onMessage?: (packet: IS_MSO) => void;
  onStateChanged?: (packet: IS_STA) => void;
  onVersion?: (packet: IS_VER) => void;
};

export function InSim({
  children,
  onCameraPosition,
  onMessage,
  onStateChanged,
  onVersion,
}: InSimProps) {
  const inSim = useInSim();

  // TODO add all info packet listeners
  usePacketEventListener(inSim, PacketType.ISP_CPP, onCameraPosition);
  usePacketEventListener(inSim, PacketType.ISP_MSO, onMessage);
  usePacketEventListener(inSim, PacketType.ISP_STA, onStateChanged);
  usePacketEventListener(inSim, PacketType.ISP_VER, onVersion);

  return <>{children}</>;
}

function usePacketEventListener<T extends keyof InSimPacketEvents>(
  inSim: NodeInSim,
  event: T,
  listener?: InSimPacketEvents[T],
) {
  useEffect(() => {
    listener && inSim.on(event, listener as InSimEvents[T]);

    return () => {
      listener && inSim.off(event, listener as InSimEvents[T]);
    };
  }, [listener]);
}
