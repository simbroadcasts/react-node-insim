import { InSimFlags } from 'node-insim/packets';
import React, { StrictMode } from 'react';
import {
  ConnectionsProvider,
  createRoot,
  PlayersProvider,
} from 'react-node-insim';

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
    <PlayersProvider>
      <ConnectionsProvider>
        <PlayersAndConnectionsExample />
        <PacketHooksExample />
        <FlexExample isEditorVisible={false} />
        <ButtonExample />
        <GridExample />
        <StackExample />
        <ToggleButtonExample />
        <ToggleButtonGroupExample />
        <TextBoxExample />
      </ConnectionsProvider>
    </PlayersProvider>
  </StrictMode>,
);

process.on('uncaughtException', (error) => {
  console.log(error.message);
});
