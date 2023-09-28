import type { IS_NPL, IS_PLL } from 'node-insim/packets';
import { IS_TINY, PacketType, TinyType } from 'node-insim/packets';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { useInSim } from './useInSim';

type Player = Pick<
  IS_NPL,
  'UCID' | 'PLID' | 'PName' | 'Flags' | 'PType' | 'Plate'
>;
const PlayersContext = createContext<Record<number, Player> | null>(null);

export function PlayersProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const inSim = useInSim();

  useEffect(() => {
    inSim.send(new IS_TINY({ ReqI: 1, SubT: TinyType.TINY_NPL }));
  }, []);

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

  return (
    <PlayersContext.Provider value={players}>
      {children}
    </PlayersContext.Provider>
  );
}

export function usePlayers() {
  const players = useContext(PlayersContext);

  if (!players) {
    throw new Error('usePlayers must be called within <PlayersProvider>.');
  }

  return players;
}
