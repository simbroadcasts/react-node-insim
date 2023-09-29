import { log } from 'debug';
import { IS_MST } from 'node-insim/packets';
import { useMemo } from 'react';
import { useConnections, useInSim, usePlayers } from 'react-node-insim';

export function useRaceControlMessage() {
  const inSim = useInSim();
  const connections = useConnections();
  const players = usePlayers();

  const sendRaceControlMessageToPlayer = (
    PLID: number,
    text: string,
    timeout?: number,
  ) => {
    const player = players.get(PLID);

    if (!player) {
      log(`Error: Could not send RCM - player not found for PLID ${PLID}`);
      return;
    }

    sendRaceControlMessageToConnection(player.UCID, text, timeout);
  };

  const sendRaceControlMessageToConnection = (
    UCID: number,
    text: string,
    timeout?: number,
  ) => {
    const connection = connections.get(UCID);

    if (!connection) {
      log(`Error: Could not send RCM - connection not found for UCID ${UCID}`);
      return;
    }

    sendRaceControlMessageToUserName(connection.UName, text, timeout);
  };

  const sendRaceControlMessageToUserName = (
    userName: string,
    text: string,
    timeout?: number,
  ) => {
    log('sendRaceControlMessageToUserName', userName, text);

    inSim.send(new IS_MST({ Msg: `/rcm ${text}` }));
    inSim.send(new IS_MST({ Msg: `/rcm_ply ${userName}` }));

    if (timeout) {
      setTimeout(() => {
        inSim.send(new IS_MST({ Msg: `/rcc_ply ${userName}` }));
      }, timeout);
    }
  };

  return useMemo(
    () => ({
      sendRaceControlMessageToPlayer,
      sendRaceControlMessageToConnection,
    }),
    [players, connections, inSim],
  );
}
