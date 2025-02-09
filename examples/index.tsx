import { InSimFlags } from 'node-insim/packets';
import React, { StrictMode } from 'react';
import { ConnectionsPlayersProvider, createRoot } from 'react-node-insim';

import {
  ButtonExample,
  FlexExample,
  GridExample,
  PacketHooksExample,
  PlayersAndConnectionsExample,
  StackExample,
  TextBoxExample,
  ToggleButtonExample,
  ToggleButtonGroupExample,
} from './apps';

const root = createRoot({
  name: 'React InSim',
  host: '127.0.0.1',
  port: 29999,
  flags: InSimFlags.ISF_LOCAL,
});

root.render(
  <StrictMode>
    <ConnectionsPlayersProvider>
      <PlayersAndConnectionsExample />
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
