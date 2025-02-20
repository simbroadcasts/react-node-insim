import './env';

import { InSimFlags } from 'node-insim/packets';
import React, { StrictMode } from 'react';
import { ConnectionsPlayersProvider, createRoot } from 'react-node-insim';
import Yoga from 'yoga-layout-prebuilt';

import { Button } from '../src/lib/components/Button';
import { Flex } from '../src/lib/components/layout/Flex';
import { log } from '../src/lib/internals/logger';
import {
  ButtonExample,
  FlexExample,
  GridExample,
  PacketHooksExample,
  PlayersAndConnectionsExample,
  ScopesExample,
  StackExample,
  TextBoxExample,
  ToggleButtonExample,
  ToggleButtonGroupExample,
} from './apps';

const host = process.env.HOST ?? '127.0.0.1';

const root = createRoot({
  name: 'React InSim',
  host,
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 29999,
  adminPassword: process.env.ADMIN ?? '',
  flags: host === '127.0.0.1' ? InSimFlags.ISF_LOCAL : undefined,
  rootNodeStyle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

root.render(
  // TODO flex={1} results in 0 width
  // <>
  //   <Button flex={1} height={5}>
  //     Hello
  //   </Button>
  //   <Button flex={1} height={5}>
  //     World
  //   </Button>
  // </>,
  <Flex width={200} height={50}>
    <Button width={20} height={10}>
      test1
    </Button>
    <Button width={20} height={10}>
      test2
    </Button>
  </Flex>,
  // <Flex
  //   width={100}
  //   height={40}
  //   flexDirection="row"
  //   justifyContent="flex-end"
  //   alignItems="stretch"
  // >
  //   <Button flex={1} width={10} height={5}>
  //     Hello
  //   </Button>
  //   <Button flex={1} width={20} height={5}>
  //     World
  //   </Button>
  // </Flex>,
  // <>
  //   <Button width={20} height={5}>
  //     Hello
  //   </Button>
  //   <Button width={20} height={5}>
  //     World
  //   </Button>
  // </>,
);

// root.render(
//   <StrictMode>
//     <ConnectionsPlayersProvider>
//       <PlayersAndConnectionsExample />
//       <ScopesExample />
//       <PacketHooksExample />
//       <FlexExample isEditorVisible={false} />
//       <ButtonExample />
//       <GridExample />
//       <StackExample />
//       <ToggleButtonExample />
//       <ToggleButtonGroupExample />
//       <TextBoxExample />
//     </ConnectionsPlayersProvider>
//   </StrictMode>,
// );

process.on('uncaughtException', (error) => {
  console.log(error.message);
});
