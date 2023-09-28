import type { IS_NCN } from 'node-insim/packets';
import { IS_TINY, PacketType, TinyType } from 'node-insim/packets';
import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import { useInSim, useOnConnect, useOnPacket } from 'react-node-insim';

type Connection = Pick<IS_NCN, 'UCID' | 'UName' | 'PName' | 'Admin' | 'Flags'>;

const ConnectionsContext = createContext<Record<number, Connection> | null>(
  null,
);

export function ConnectionsProvider({ children }: { children: ReactNode }) {
  const [connections, setConnections] = useState<Record<number, Connection>>(
    {},
  );
  const inSim = useInSim();

  useOnConnect(() => {
    inSim.send(new IS_TINY({ ReqI: 1, SubT: TinyType.TINY_NCN }));
  });

  useOnPacket(PacketType.ISP_ISM, (packet) => {
    if (packet.ReqI > 0) {
      return;
    }

    setConnections({});
    inSim.send(new IS_TINY({ ReqI: 1, SubT: TinyType.TINY_NCN }));
  });

  useOnPacket(PacketType.ISP_NCN, (packet) => {
    setConnections((connections) => ({
      ...connections,
      [packet.UCID]: {
        UCID: packet.UCID,
        UName: packet.UName,
        PName: packet.PName,
        Flags: packet.Flags,
        Admin: packet.Admin,
      },
    }));
  });

  useOnPacket(PacketType.ISP_CNL, (packet) => {
    setConnections((connections) => {
      const newConnections = { ...connections };

      delete newConnections[packet.UCID];

      return newConnections;
    });
  });

  useOnPacket(PacketType.ISP_CPR, (packet) => {
    setConnections((connections) => {
      if (!connections[packet.UCID]) {
        return connections;
      }

      return {
        ...connections,
        [packet.UCID]: {
          ...connections[packet.UCID],
          PName: packet.PName,
        },
      };
    });
  });

  return (
    <ConnectionsContext.Provider value={connections}>
      {children}
    </ConnectionsContext.Provider>
  );
}

export function useConnections() {
  const connections = useContext(ConnectionsContext);

  if (!connections) {
    throw new Error(
      'useConnections must be called within <ConnectionsProvider>.',
    );
  }

  return connections;
}
