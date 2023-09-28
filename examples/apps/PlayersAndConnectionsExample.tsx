import type { InSim } from 'node-insim';
import type { IS_BTC } from 'node-insim/packets';
import { IS_MST, PacketType } from 'node-insim/packets';
import {
  Button,
  useConnections,
  useOnConnect,
  useOnPacket,
  usePlayers,
  VStack,
} from 'react-node-insim';

export function PlayersAndConnectionsExample() {
  const players = usePlayers();
  const connections = useConnections();

  useOnConnect((packet, inSim) => {
    console.log(`Connected to LFS ${packet.Product} ${packet.Version}`);
    inSim.send(new IS_MST({ Msg: `/echo React Node InSim connected` }));
  });

  useOnPacket(PacketType.ISP_NCN, (packet) => {
    console.log(`New connection: ${packet.UName} (${packet.UCID})`);
  });

  const handlePlayerClick = (plid: number) => (_: IS_BTC, inSim: InSim) => {
    inSim.send(new IS_MST({ Msg: `/echo PLID ${plid}` }));
  };

  const handleConnectionClick = (ucid: number) => (_: IS_BTC, inSim: InSim) => {
    inSim.send(new IS_MST({ Msg: `/echo UCID ${ucid}` }));
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
