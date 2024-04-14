import type { IS_NCN } from 'node-insim/packets';
import { IS_TINY, PacketType, TinyType } from 'node-insim/packets';
import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';
import { useOnConnect, useOnPacket } from 'react-node-insim';

export type Connection = Pick<
  IS_NCN,
  'UCID' | 'UName' | 'PName' | 'Admin' | 'Flags'
>;

type Connections = Map<number, Connection>;

const ConnectionsContext = createContext<Connections | null>(null);

export function ConnectionsProvider({ children }: { children: ReactNode }) {
  const [connections, setConnections] = useState<Connections>(new Map());

  useOnConnect((_, inSim) => {
    inSim.send(new IS_TINY({ ReqI: 1, SubT: TinyType.TINY_NCN }));
  });

  useOnPacket(PacketType.ISP_ISM, (packet, inSim) => {
    if (packet.ReqI > 0) {
      return;
    }

    setConnections(new Map());
    inSim.send(new IS_TINY({ ReqI: 1, SubT: TinyType.TINY_NCN }));
  });

  useOnPacket(PacketType.ISP_NCN, (packet) => {
    setConnections((prevConnections) =>
      new Map(prevConnections).set(packet.UCID, {
        UCID: packet.UCID,
        UName: packet.UName,
        PName: packet.PName,
        Flags: packet.Flags,
        Admin: packet.Admin,
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

      const newConnections = new Map(prevConnections);
      newConnections.set(packet.UCID, {
        ...foundConnection,
        PName: packet.PName,
      });

      return newConnections;
    });
  });

  return (
    <ConnectionsContext.Provider value={connections}>
      {children}
    </ConnectionsContext.Provider>
  );
}

export function useConnections(): ReadonlyMap<number, Connection> & {
  map: <Item>(
    callback: (connection: Connection, key: number, map: Connection[]) => Item,
  ) => Item[];
} {
  const connections = useContext(ConnectionsContext);

  if (!connections) {
    throw new Error(
      'useConnections must be called within <ConnectionsProvider>.',
    );
  }

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
