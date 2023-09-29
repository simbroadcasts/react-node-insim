import type { IS_NPL } from 'node-insim/packets';
import { IS_TINY, PacketType, PlayerType, TinyType } from 'node-insim/packets';
import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

import { useInSim } from './useInSim';
import { useOnConnect } from './useOnConnect';
import { useOnPacket } from './useOnPacket';

type Player = Pick<
  IS_NPL,
  'UCID' | 'PLID' | 'PName' | 'Flags' | 'PType' | 'Plate'
>;

type Players = Map<number, Player>;

const PlayersContext = createContext<Players | null>(null);

export function PlayersProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Players>(new Map());
  const inSim = useInSim();

  useOnConnect(() => {
    inSim.send(new IS_TINY({ ReqI: 1, SubT: TinyType.TINY_NPL }));
  });

  useOnPacket(PacketType.ISP_ISM, (packet) => {
    if (packet.ReqI > 0) {
      return;
    }

    setPlayers(new Map());
    inSim.send(new IS_TINY({ ReqI: 1, SubT: TinyType.TINY_NPL }));
  });

  useOnPacket(PacketType.ISP_TINY, (packet) => {
    if (packet.SubT === TinyType.TINY_CLR) {
      setPlayers(new Map());
    }
  });

  useOnPacket(PacketType.ISP_NPL, (packet) => {
    setPlayers((prevPlayers) =>
      new Map(prevPlayers).set(packet.PLID, {
        UCID: packet.UCID,
        PLID: packet.PLID,
        PName: packet.PName,
        Flags: packet.Flags,
        PType: packet.PType,
        Plate: packet.Plate,
      }),
    );
  });

  useOnPacket(PacketType.ISP_PLL, (packet) => {
    setPlayers((prevPlayers) => {
      const newPlayers = new Map(prevPlayers);
      newPlayers.delete(packet.PLID);

      return newPlayers;
    });
  });

  useOnPacket(PacketType.ISP_CPR, (packet) => {
    setPlayers((prevPlayers) => {
      const matchingPlayer = Array.from(prevPlayers.values()).find(
        (player) =>
          player.UCID === packet.UCID && (player.PType & PlayerType.AI) === 0,
      );

      if (!matchingPlayer) {
        return prevPlayers;
      }

      return new Map(prevPlayers).set(matchingPlayer.PLID, {
        ...matchingPlayer,
        PName: packet.PName,
        Plate: packet.Plate,
      });
    });
  });

  useOnPacket(PacketType.ISP_TOC, (packet) => {
    setPlayers((prevPlayers) => {
      const foundPlayer = prevPlayers.get(packet.PLID);
      if (!foundPlayer) {
        return prevPlayers;
      }

      return new Map(prevPlayers).set(packet.PLID, {
        ...foundPlayer,
        UCID: packet.NewUCID,
      });
    });
  });

  return (
    <PlayersContext.Provider value={players}>
      {children}
    </PlayersContext.Provider>
  );
}

export function usePlayers(): ReadonlyMap<number, Player> & {
  map: <Item>(
    callback: (player: Player, key: number, map: Player[]) => Item,
  ) => Item[];
} {
  const players = useContext(PlayersContext);

  if (!players) {
    throw new Error('usePlayers must be called within <PlayersProvider>.');
  }

  return useMemo(
    () =>
      Object.freeze({
        entries: players.entries.bind(players),
        forEach: players.forEach.bind(players),
        get: players.get.bind(players),
        has: players.has.bind(players),
        keys: players.keys.bind(players),
        size: players.size,
        values: players.values.bind(players),
        map: <Item,>(
          callback: (player: Player, key: number, map: Player[]) => Item,
        ) => Array.from(players.values()).map(callback),
        [Symbol.iterator]: players[Symbol.iterator].bind(players),
      }),
    [players],
  );
}
