# React Node InSim

React Node InSim is a [React renderer](https://legacy.reactjs.org/docs/codebase-overview.html#renderers) for [Live for Speed](https://www.lfs.net/) [InSim](https://en.lfsmanual.net/wiki/InSim.txt) buttons. It provides layout components for easier button positioning, hooks for handling incoming InSim packets and tracking server connections & players.

It is based on [Node InSim](https://github.com/simbroadcasts/node-insim), a Node.js library for InSim communication.

It allows you to create things like this:

<img src="docs/insim-buttons-preview.gif" width="400" alt="Live list of connections and players" />

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

### Adding state

You can use [React hooks](https://react.dev/reference/react) as usual to display stateful data via InSim.

<img src="docs/button-current-time.gif" width="300" alt="Button showing current time" />

```tsx
import { InSimFlags } from 'node-insim/packets';
import { useEffect, useState } from 'react';
import { Button, createRoot } from 'react-node-insim';

const root = createRoot({
  name: 'React InSim',
  host: '127.0.0.1',
  port: 29999,
  flags: InSimFlags.ISF_LOCAL,
});

root.render(<App />);

function App() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  });

  return (
    <Button top={100} left={80} width={40} height={10}>
      Current time: {time.toLocaleTimeString()}
    </Button>
  );
}
```

## Button

The Button component is used to display a button in LFS.

- Buttons are drawn on a 200 by 200 canvas using absolute positioning
- The maximum number of rendered buttons on a screen is 240

### Import

```ts
import { Button } from 'react-node-insim';
```

### Usage

<img src="docs/button.png" alt="Button" />

```tsx
<Button top={100} left={80} width={30} height={10}>
  Button
</Button>
```

#### Button placement

Buttons use XY coordinates to position themselves on the screen. The `top` and `left` props control the button's X and Y position on the screen. The allowed range of values is 0 to 200.

<img src="docs/button-placement.png" alt="Button placement" />

```tsx
<>
  <Button width={12} height={6} top={100} left={40}>
    Button
  </Button>
  <Button width={12} height={6} top={100} left={53}>
    Button
  </Button>
  <Button width={12} height={6} top={106} left={40}>
    Button
  </Button>
  <Button width={12} height={6} top={106} left={53}>
    Button
  </Button>
</>
```

#### Button sizes

Use the `width` and `height` props to change the dimensions of the button. The allowed range of values is 0 to 200.

<img src="docs/button-sizes.png" alt="Button sizes" />

```tsx
<>
  <Button variant="light" top={100} left={40} width={6} height={4}>
    Button
  </Button>
  <Button variant="light" top={99} left={47} width={10} height={6}>
    Button
  </Button>
  <Button variant="light" top={97} left={58} width={14} height={10}>
    Button
  </Button>
</>
```

#### Button variants

Use the `variant` prop to change the button's visual style. You can use `light` or `dark`. If you don't specify a variant, the button will have transparent background and a light gray text color.

<img src="docs/button-variants.png" alt="Button variants" />

```tsx
<>
  <Button top={100} left={40} width={12} height={6} variant="light">
    Button
  </Button>
  <Button top={100} left={53} width={12} height={6} variant="dark">
    Button
  </Button>
</>
```

#### Button text colors

Use the `color` prop to customize the button's text color. If you don't specify a color, the button text will be `lightgrey`.

<img src="docs/button-text-colors.png" alt="Button text colors" />

```tsx
<>
  <Button top={73} left={40} width={12} height={6} color="lightgrey">
    lightgrey
  </Button>
  <Button top={73} left={53} width={12} height={6} color="title">
    title
  </Button>
  <Button top={73} left={66} width={12} height={6} color="unselected">
    unselected
  </Button>
  <Button top={73} left={79} width={12} height={6} color="selected">
    selected
  </Button>
  <Button top={80} left={40} width={12} height={6} color="ok">
    ok
  </Button>
  <Button top={80} left={53} width={12} height={6} color="cancel">
    cancel
  </Button>
  <Button top={80} left={66} width={12} height={6} color="textstring">
    textstring
  </Button>
  <Button top={80} left={79} width={12} height={6} color="unavailable">
    unavailable
  </Button>
</>
```

#### Button background colors

Use the `background` prop to customize the button's background color. If you don't specify a color, the background will be transparent.

<img src="docs/button-background-colors.png" alt="Button background colors" />

```tsx
<>
  <Button top={67} left={40} width={12} height={6} background="light">
    light
  </Button>
  <Button top={67} left={53} width={12} height={6} background="dark">
    dark
  </Button>
  <Button top={67} left={66} width={12} height={6} background="transparent">
    transparent
  </Button>
</>
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
