# React Node InSim

React Node InSim is a [React renderer](https://legacy.reactjs.org/docs/codebase-overview.html#renderers) for [Live for Speed](https://www.lfs.net/) [InSim](https://en.lfsmanual.net/wiki/InSim.txt) buttons. It provides layout components for easier button positioning, hooks for handling incoming InSim packets and tracking server connections & players.

It is based on [Node InSim](https://github.com/simbroadcasts/node-insim), a Node.js library for InSim communication.

It allows you to create things like this:

<img src="docs/insim-buttons-preview.gif" width="400" />

<details>
  <summary>Show source code</summary>

```tsx
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
    <PlayersProvider>
      <ConnectionsProvider>
        <App />
      </ConnectionsProvider>
    </PlayersProvider>
  </StrictMode>,
);

function App() {
  // Get the list of current players and connections
  const players = usePlayers();
  const connections = useConnections();

  // Do something after the InSim app has been connected to LFS
  useOnConnect((packet, inSim) => {
    console.log(`Connected to LFS ${packet.Product} ${packet.Version}`);
    inSim.send(new IS_MST({ Msg: `React Node InSim connected` }));
  });

  // Handle incoming packets
  useOnPacket(PacketType.ISP_NCN, (packet) => {
    console.log(`New connection: ${packet.UName}`);
  });

  // Clickable buttons
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
        background="dark"
        top={15}
        left={40}
        width={30}
        height={5}
        UCID={255}
      >
        {players.map((player) => (
          <Button key={player.PLID} onClick={handlePlayerClick(player.PLID)}>
            {player.PName}
          </Button>
        ))}
      </VStack>
      <Button top={10} left={70} width={30} height={5} UCID={255} color="title">
        Connections
      </Button>
      <VStack
        background="dark"
        top={15}
        left={70}
        width={30}
        height={5}
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
```

</details>

## Installation

### Requirements

- [Node.js](https://nodejs.org/)
- [Node InSim](https://github.com/simbroadcasts/node-insim)
- [React 18](https://github.com/facebook/react)

NPM

```shell
npm install react@18 node-insim react-node-insim
```

Yarn

```shell
yarn add react@18 node-insim react-node-insim
```

pnpm

```shell
pnpm add react@18 node-insim react-node-insim
```

## Basic usage

Displaying an InSim button on a local computer

```tsx
import { InSimFlags } from 'node-insim/packets';
import { Button, createRoot } from 'react-node-insim';

const root = createRoot({
  name: 'React InSim',
  host: '127.0.0.1',
  port: 29999,
  flags: InSimFlags.ISF_LOCAL,
});

root.render(
  <Button top={100} left={80} width={30} height={10}>
    Hello InSim!
  </Button>,
);
```

## Buttons

To render an InSim button, use the `<Button>` component.

- InSim buttons are drawn on a 200 by 200 canvas
- The maximum number of rendered buttons on a screen is 240

### Import

```ts
import { Button } from 'react-node-insim';
```

### Usage

<img src="docs/button-usage.png" />

```tsx
<Button top={100} left={80} width={30} height={10}>
  Button
</Button>
```

### Props

🚧

#### `children`

`string | number | (string | number)[]`

0 to 240 characters of text

## Layout

🚧

## Hooks

🚧

## Development

### Requirements

- [Node.js 18](https://nodejs.org/)
- [Yarn v1](https://classic.yarnpkg.com/)
- [Live for Speed](https://www.lfs.net/)

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
