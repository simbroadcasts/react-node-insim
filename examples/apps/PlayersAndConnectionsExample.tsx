import type { InSim } from 'node-insim';
import type { IS_BTC } from 'node-insim/packets';
import { IS_MST, MessageSound } from 'node-insim/packets';
import {
  Button,
  useConnections,
  useMessage,
  usePlayers,
  useRaceControlMessage,
  VStack,
} from 'react-node-insim';

export function PlayersAndConnectionsExample() {
  const players = usePlayers();
  const connections = useConnections();
  const { sendRaceControlMessageToConnection, sendRaceControlMessageToPlayer } =
    useRaceControlMessage();
  const { sendMessageToConnection, sendMessageToPlayer } = useMessage();

  const handlePlayerClick =
    (PLID: number) => (packet: IS_BTC, inSim: InSim) => {
      inSim.send(new IS_MST({ Msg: `/echo PLID ${PLID}` }));
      sendRaceControlMessageToConnection(
        packet.UCID,
        `Clicked PLID ${PLID}`,
        2000,
      );
      sendMessageToConnection(
        packet.UCID,
        `Clicked PLID ${PLID}`,
        MessageSound.SND_SYSMESSAGE,
      );

      sendRaceControlMessageToPlayer(
        PLID,
        'Someone clicked your player name',
        2000,
      );
      sendMessageToPlayer(
        PLID,
        'Someone clicked your player name',
        MessageSound.SND_SYSMESSAGE,
      );
    };

  const handleConnectionClick =
    (UCID: number) => (packet: IS_BTC, inSim: InSim) => {
      inSim.send(new IS_MST({ Msg: `/echo UCID ${UCID}` }));
      sendRaceControlMessageToConnection(
        packet.UCID,
        `Clicked UCID ${UCID}`,
        2000,
      );
      sendMessageToConnection(
        packet.UCID,
        `Clicked UCID ${UCID}`,
        MessageSound.SND_SYSMESSAGE,
      );

      sendRaceControlMessageToConnection(
        UCID,
        'Someone clicked your connection name',
        2000,
      );
      sendMessageToConnection(
        UCID,
        'Someone clicked your connection name',
        MessageSound.SND_SYSMESSAGE,
      );
    };

  const top = 0;
  const left = 164;
  const width = 18;
  const height = 4;

  return (
    <>
      <Button
        top={top}
        left={left}
        width={width}
        height={height}
        UCID={255}
        color="title"
      >
        Players ({players.size})
      </Button>
      <VStack
        background="dark"
        top={top + height}
        left={left}
        width={width}
        height={height}
        UCID={255}
      >
        {players.map((player) => (
          <Button key={player.PLID} onClick={handlePlayerClick(player.PLID)}>
            {player.PName}
          </Button>
        ))}
      </VStack>
      <Button
        top={top}
        left={left + width}
        width={width}
        height={height}
        UCID={255}
        color="title"
      >
        Connections ({connections.size})
      </Button>
      <VStack
        background="dark"
        top={top + height}
        left={left + width}
        width={width}
        height={height}
        UCID={255}
      >
        {connections.map((connection) => (
          <Button
            key={connection.UCID}
            onClick={handleConnectionClick(connection.UCID)}
          >
            {connection.UName}
          </Button>
        ))}
      </VStack>
    </>
  );
}
