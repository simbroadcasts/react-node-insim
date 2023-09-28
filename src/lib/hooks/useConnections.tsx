import type { IS_CNL, IS_CPR, IS_NCN } from 'node-insim/packets';
import { IS_TINY, PacketType, TinyType } from 'node-insim/packets';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useInSim } from 'react-node-insim';

type Connection = Pick<IS_NCN, 'UCID' | 'UName' | 'PName' | 'Admin' | 'Flags'>;

const ConnectionsContext = createContext<Record<number, Connection> | null>(
  null,
);

export function ConnectionsProvider({ children }: { children: ReactNode }) {
  const [connections, setConnections] = useState<Record<number, Connection>>(
    {},
  );
  const inSim = useInSim();

  useEffect(() => {
    inSim.send(new IS_TINY({ ReqI: 1, SubT: TinyType.TINY_NCN }));
  }, []);

  useEffect(() => {
    const onNewConnection = (packet: IS_NCN) => {
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
    };
    inSim.on(PacketType.ISP_NCN, onNewConnection);

    return () => {
      inSim.off(PacketType.ISP_NCN, onNewConnection);
    };
  }, []);

  useEffect(() => {
    const onConnectionLeave = (packet: IS_CNL) => {
      setConnections((connections) => {
        const newConnections = { ...connections };

        delete newConnections[packet.UCID];

        return newConnections;
      });
    };
    inSim.on(PacketType.ISP_CNL, onConnectionLeave);

    return () => {
      inSim.off(PacketType.ISP_CNL, onConnectionLeave);
    };
  }, []);

  useEffect(() => {
    const onPlayerRename = (packet: IS_CPR) => {
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
    };
    inSim.on(PacketType.ISP_CPR, onPlayerRename);

    return () => {
      inSim.off(PacketType.ISP_CPR, onPlayerRename);
    };
  }, []);

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
