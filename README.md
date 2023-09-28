# React Node InSim

React Node InSim is a React renderer for Live for Speed InSim buttons. It also provides hooks for handling incoming packets.

## What can it do?

The following example displays a list of players and connections as InSim buttons:

```typescript jsx
import type { InSim } from 'node-insim';
import { InSimFlags, IS_BTC, IS_MST, PacketType } from 'node-insim/packets';
import { StrictMode } from 'react';
import {
  Button,
  ConnectionsProvider,
  createRoot,
  PlayersProvider,
  useConnections,
  useOnConnect,
  useOnPacket,
  usePlayers,
  VStack,
} from 'react-node-insim';

const root = createRoot({
  name: 'React InSim',
  host: '127.0.0.1',
  port: 29999,
  flags: InSimFlags.ISF_LOCAL,
});

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);

export function App() {
  const players = usePlayers();
  const connections = useConnections();

  useOnConnect((packet, inSim) => {
    console.log(`Connected to LFS ${packet.Product} ${packet.Version}`);
    inSim.send(new IS_MST({ Msg: `React Node InSim connected` }));
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
```

## Requirements

- Node.js
- React
- Node InSim

## Installation

NPM

```shell
npm install --save react-node-insim node-insim react
```

Yarn

```shell
yarn add react-node-insim node-insim react
```

pnpm

```shell
pnpm add react-node-insim node-insim react
```

## Development

### Requirements

- Node.js 18
- Yarn 1
- LFS

### Installation

```shell
yarn
```

### Run example app

```shell
yarn start
```

### Lint code

```shell
yarn lint
```

### Format code

```shell
yarn format
```
