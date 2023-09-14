import type { IS_NPL, IS_PLL } from 'node-insim/packets';
import { PacketType } from 'node-insim/packets';
import { useEffect, useState } from 'react';
import { useInSim } from 'react-node-insim';

type Player = Pick<
  IS_NPL,
  'UCID' | 'PLID' | 'PName' | 'Flags' | 'PType' | 'Plate'
>;

export function usePlayers() {
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const inSim = useInSim();

  useEffect(() => {
    const onNewPlayer = (packet: IS_NPL) => {
      setPlayers({
        ...players,
        [packet.PLID]: {
          UCID: packet.UCID,
          PLID: packet.PLID,
          PName: packet.PName,
          Flags: packet.Flags,
          PType: packet.PType,
          Plate: packet.Plate,
        },
      });
    };
    inSim.on(PacketType.ISP_NPL, onNewPlayer);

    return () => {
      inSim.off(PacketType.ISP_NPL, onNewPlayer);
    };
  }, []);

  useEffect(() => {
    const onPlayerLeave = (packet: IS_PLL) => {
      const newPlayers = { ...players };

      delete newPlayers[packet.PLID];

      setPlayers(newPlayers);
    };
    inSim.on(PacketType.ISP_PLL, onPlayerLeave);

    return () => {
      inSim.off(PacketType.ISP_PLL, onPlayerLeave);
    };
  }, []);

  return players;
}
