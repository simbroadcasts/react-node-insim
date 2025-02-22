import type { InSim } from 'node-insim';
import type { IS_BTC } from 'node-insim/packets';
import { IS_MST, MessageSound } from 'node-insim/packets';
import {
  Button,
  Flex,
  useConnections,
  useInSim,
  usePlayers,
  useRaceControlMessage,
  VStack,
} from 'react-node-insim';

export function PlayersAndConnectionsExample() {
  const players = usePlayers();
  const connections = useConnections();
  const { sendRaceControlMessageToConnection, sendRaceControlMessageToPlayer } =
    useRaceControlMessage();
  const { sendMessageToConnection, sendMessageToPlayer } = useInSim();

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

  const width = 18;
  const height = Array.from(players.values()).length > 3 ? 5 : 4;
  const UCID = 255;

  return (
    // <Flex
    //   flexDirection="column"
    //   width={width}
    //   alignItems="center"
    //   justifyContent="center"
    // >
    <>
      {players.map((player) => (
        <Button
          key={player.PLID}
          width={width}
          height={height}
          UCID={UCID}
          background="dark"
          onClick={handlePlayerClick(player.PLID)}
        >
          {player.PName}
        </Button>
      ))}
    </>
    // </Flex>
  );
}
