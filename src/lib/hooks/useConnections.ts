import type { IS_CNL, IS_CPR, IS_NCN } from 'node-insim/packets';
import { IS_TINY, PacketType, TinyType } from 'node-insim/packets';
import { useEffect, useState } from 'react';
import { useInSim } from 'react-node-insim';

type Connection = Pick<IS_NCN, 'UCID' | 'UName' | 'PName' | 'Admin' | 'Flags'>;

export function useConnections() {
  const [connections, setConnections] = useState<Record<number, Connection>>(
    {},
  );
  const inSim = useInSim();

  useEffect(() => {
    inSim.send(new IS_TINY({ ReqI: 1, SubT: TinyType.TINY_NPL }));
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

  return connections;
}
