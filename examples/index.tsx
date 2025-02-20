import './env';

import { InSimFlags } from 'node-insim/packets';
import React, { StrictMode } from 'react';
import { ConnectionsPlayersProvider, createRoot } from 'react-node-insim';

import { NewButton } from '../src/lib/components/NewButton';
import { NewFlex } from '../src/lib/components/NewFlex';
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
});

root.render(
  // TODO flex={1} results in 0 width
  // <NewFlex
  //   width={200}
  //   height={50}
  //   flexDirection="column"
  //   justifyContent="space-evenly"
  //   alignItems="stretch"
  // >
  //   <NewButton flex={1} height={5}>
  //     Hello
  //   </NewButton>
  //   <NewButton flex={1} height={5}>
  //     World
  //   </NewButton>
  // </NewFlex>,
  // <NewFlex
  //   minWidth="50%"
  //   height={40}
  //   flexDirection="row"
  //   justifyContent="space-between"
  //   alignItems="stretch"
  // >
  //   <NewButton width={10} height={5}>
  //     Hello
  //   </NewButton>
  //   <NewButton width={20} height={5}>
  //     World
  //   </NewButton>
  // </NewFlex>,
  <>
    <NewButton width={20} height={5}>
      Hello
    </NewButton>
    <NewButton width={20} height={5}>
      World
    </NewButton>
  </>,
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
