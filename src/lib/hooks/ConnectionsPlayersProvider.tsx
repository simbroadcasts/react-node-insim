import type { IS_NCN, IS_NPL } from 'node-insim/packets';
import { IS_TINY, PacketType, PlayerType, TinyType } from 'node-insim/packets';
import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';
import { useOnConnect, useOnPacket } from 'react-node-insim';

export type Connection = Pick<
  IS_NCN,
  'UCID' | 'UName' | 'PName' | 'Admin' | 'Flags'
> & {
  players: Player[];
};

type Connections = Map<number, Connection>;

const ConnectionsPlayersContext = createContext<{
  connections: Connections;
  players: Players;
} | null>(null);

export type Player = Pick<
  IS_NPL,
  'UCID' | 'PLID' | 'PName' | 'Flags' | 'PType' | 'Plate'
> & {
  connection: Connection;
};

type Players = Map<number, Player>;

export function ConnectionsPlayersProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [connections, setConnections] = useState<Connections>(new Map());
  const [players, setPlayers] = useState<Players>(new Map());

  useOnConnect((_, inSim) => {
    inSim.send(new IS_TINY({ ReqI: 1, SubT: TinyType.TINY_NCN }));
    inSim.send(new IS_TINY({ ReqI: 1, SubT: TinyType.TINY_NPL }));
  });

  useOnPacket(PacketType.ISP_ISM, (packet, inSim) => {
    if (packet.ReqI > 0) {
      return;
    }

    setConnections(new Map());
    inSim.send(new IS_TINY({ ReqI: 1, SubT: TinyType.TINY_NCN }));

    setPlayers(new Map());
    inSim.send(new IS_TINY({ ReqI: 1, SubT: TinyType.TINY_NPL }));
  });

  useOnPacket(PacketType.ISP_TINY, (packet) => {
    if (packet.SubT === TinyType.TINY_CLR) {
      setPlayers(new Map());
      setConnections((prevConnections) => {
        const newConnections = Array.from(prevConnections.entries()).map<
          [number, Connection]
        >(([ucid, connection]) => [
          ucid,
          {
            ...connection,
            players: [],
          },
        ]);

        return new Map(newConnections);
      });
    }
  });

  useOnPacket(PacketType.ISP_NCN, (packet) => {
    setConnections((prevConnections) =>
      new Map(prevConnections).set(packet.UCID, {
        UCID: packet.UCID,
        UName: packet.UName,
        PName: packet.PName,
        Flags: packet.Flags,
        Admin: packet.Admin,
        players: [],
      }),
    );
  });

  useOnPacket(PacketType.ISP_CNL, (packet) => {
    setConnections((prevConnections) => {
      const newConnections = new Map(prevConnections);

      newConnections.delete(packet.UCID);

      return newConnections;
    });
  });

  useOnPacket(PacketType.ISP_CPR, (packet) => {
    setConnections((prevConnections) => {
      const foundConnection = prevConnections.get(packet.UCID);

      if (!foundConnection) {
        return prevConnections;
      }

      const humanPlayer = foundConnection.players.find(
        ({ PType }) => (PType & PlayerType.AI) === 0,
      );

      const players = foundConnection.players.map<Player>((player) => {
        if ((player.PType & PlayerType.AI) === 0) {
          return {
            ...player,
            PName: packet.PName,
          };
        }

        return player;
      });

      const newConnections = new Map(prevConnections);
      newConnections.set(packet.UCID, {
        ...foundConnection,
        PName: packet.PName,
        ...(humanPlayer ? { players } : {}),
      });

      return newConnections;
    });

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

  useOnPacket(PacketType.ISP_NPL, (packet) => {
    const connection = connections.get(packet.UCID);

    if (!connection) {
      return;
    }

    setPlayers((prevPlayers) =>
      new Map(prevPlayers).set(packet.PLID, {
        UCID: packet.UCID,
        PLID: packet.PLID,
        PName: packet.PName,
        Flags: packet.Flags,
        PType: packet.PType,
        Plate: packet.Plate,
        connection,
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

  useOnPacket(PacketType.ISP_TOC, (packet) => {
    setPlayers((prevPlayers) => {
      const foundPlayer = prevPlayers.get(packet.PLID);
      if (!foundPlayer) {
        return prevPlayers;
      }

      const connection = connections.get(packet.NewUCID);
      if (!connection) {
        return prevPlayers;
      }

      return new Map(prevPlayers).set(packet.PLID, {
        ...foundPlayer,
        UCID: packet.NewUCID,
        connection,
      });
    });
  });

  return (
    <ConnectionsPlayersContext.Provider value={{ connections, players }}>
      {children}
    </ConnectionsPlayersContext.Provider>
  );
}

export function useConnections(): ReadonlyMap<number, Connection> & {
  map: <Item>(
    callback: (connection: Connection, key: number, map: Connection[]) => Item,
  ) => Item[];
} {
  const connectionsPlayersContext = useContext(ConnectionsPlayersContext);

  if (!connectionsPlayersContext) {
    throw new Error(
      'useConnections must be called within <ConnectionsPlayersProvider>.',
    );
  }

  const { connections } = connectionsPlayersContext;

  return useMemo(
    () =>
      Object.freeze({
        entries: connections.entries.bind(connections),
        forEach: connections.forEach.bind(connections),
        get: connections.get.bind(connections),
        has: connections.has.bind(connections),
        keys: connections.keys.bind(connections),
        size: connections.size,
        values: connections.values.bind(connections),
        map: <Item,>(
          callback: (
            connection: Connection,
            key: number,
            map: Connection[],
          ) => Item,
        ) => Array.from(connections.values()).map(callback),
        [Symbol.iterator]: connections[Symbol.iterator].bind(connections),
      }),
    [connections],
  );
}

export function usePlayers(): ReadonlyMap<number, Player> & {
  map: <Item>(
    callback: (player: Player, key: number, map: Player[]) => Item,
  ) => Item[];
} {
  const connectionsPlayersContext = useContext(ConnectionsPlayersContext);

  if (!connectionsPlayersContext) {
    throw new Error(
      'usePlayers must be called within <ConnectionsPlayersProvider>.',
    );
  }

  const { players } = connectionsPlayersContext;

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
