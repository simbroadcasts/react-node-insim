import type { IS_NPL } from 'node-insim/packets';
import { IS_TINY, PacketType, PlayerType, TinyType } from 'node-insim/packets';
import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

import { useInSim } from './useInSim';
import { useOnConnect } from './useOnConnect';
import { useOnPacket } from './useOnPacket';

type Player = Pick<
  IS_NPL,
  'UCID' | 'PLID' | 'PName' | 'Flags' | 'PType' | 'Plate'
>;
const PlayersContext = createContext<Record<number, Player> | null>(null);

export function PlayersProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const inSim = useInSim();

  useOnConnect(() => {
    inSim.send(new IS_TINY({ ReqI: 1, SubT: TinyType.TINY_NPL }));
  });

  useOnPacket(PacketType.ISP_ISM, (packet) => {
    if (packet.ReqI > 0) {
      return;
    }

    setPlayers({});
    inSim.send(new IS_TINY({ ReqI: 1, SubT: TinyType.TINY_NCN }));
  });

  useOnPacket(PacketType.ISP_TINY, (packet) => {
    if (packet.SubT === TinyType.TINY_CLR) {
      setPlayers({});
    }
  });

  useOnPacket(PacketType.ISP_NPL, (packet) => {
    setPlayers((players) => ({
      ...players,
      [packet.PLID]: {
        UCID: packet.UCID,
        PLID: packet.PLID,
        PName: packet.PName,
        Flags: packet.Flags,
        PType: packet.PType,
        Plate: packet.Plate,
      },
    }));
  });

  useOnPacket(PacketType.ISP_PLL, (packet) => {
    setPlayers((players) => {
      const newPlayers = { ...players };

      delete newPlayers[packet.PLID];

      return newPlayers;
    });
  });

  useOnPacket(PacketType.ISP_CPR, (packet) => {
    setPlayers((players) => {
      const matchingPlayer = Object.values(players).find(
        (player) =>
          player.UCID === packet.UCID && (player.PType & PlayerType.AI) === 0,
      );

      if (!matchingPlayer) {
        return players;
      }

      const newPlayers = { ...players };

      newPlayers[matchingPlayer.PLID] = {
        ...matchingPlayer,
        PName: packet.PName,
        Plate: packet.Plate,
      };

      return newPlayers;
    });
  });

  useOnPacket(PacketType.ISP_TOC, (packet) => {
    setPlayers((players) => ({
      ...players,
      [packet.PLID]: {
        ...players[packet.PLID],
        UCID: packet.NewUCID,
      },
    }));
  });

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
