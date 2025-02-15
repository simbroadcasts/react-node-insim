import './env';

import { InSimFlags } from 'node-insim/packets';
import React, { StrictMode } from 'react';
import { ConnectionsPlayersProvider, createRoot } from 'react-node-insim';

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
  <StrictMode>
    <ConnectionsPlayersProvider>
      <PlayersAndConnectionsExample />
      <ScopesExample />
      <PacketHooksExample />
      <FlexExample isEditorVisible={false} />
      <ButtonExample />
      <GridExample />
      <StackExample />
      <ToggleButtonExample />
      <ToggleButtonGroupExample />
      <TextBoxExample />
    </ConnectionsPlayersProvider>
  </StrictMode>,
);

process.on('uncaughtException', (error) => {
  console.log(error.message);
});
