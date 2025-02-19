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
  <NewFlex width={50} height={40}>
    <NewButton width={20} height={5}>
      Hello
    </NewButton>
    <NewButton width={20} height={5}>
      World
    </NewButton>
  </NewFlex>,
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
