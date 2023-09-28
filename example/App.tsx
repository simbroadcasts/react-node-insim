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

export function App() {
  const players = usePlayers();
  const connections = useConnections();

  useOnConnect((packet, inSim) => {
    console.log(`Connected to LFS ${packet.Product} ${packet.Version}`);
    inSim.send(new IS_MST({ Msg: `/echo React Node InSim connected` }));
  });

  useOnPacket(PacketType.ISP_NCN, (packet) => {
    console.log(`New connection: ${packet.UName}`);
  });

  const handlePlayerClick = (plid: number) => (_: IS_BTC, inSim: InSim) => {
    inSim.send(new IS_MST({ Msg: `/echo PLID ${plid}` }));
  };

  const handleConnectionClick = (ucid: number) => (_: IS_BTC, inSim: InSim) => {
    inSim.send(new IS_MST({ Msg: `/echo UCID ${ucid}` }));
  };

  return (
    <>
      <Button top={10} left={40} width={30} height={5} UCID={255} color="title">
        Players
      </Button>
      <VStack
        variant="dark"
        top={15}
        left={40}
        width={30}
        height={5}
        UCID={255}
      >
        {Object.values(players).map((player) => (
          <Button key={player.PLID} onClick={handlePlayerClick(player.PLID)}>
            {player.PName}
          </Button>
        ))}
      </VStack>
      <Button top={10} left={70} width={30} height={5} UCID={255} color="title">
        Connections
      </Button>
      <VStack
        variant="dark"
        top={15}
        left={70}
        width={30}
        height={5}
        UCID={255}
      >
        {Object.values(connections).map((connection) => (
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
