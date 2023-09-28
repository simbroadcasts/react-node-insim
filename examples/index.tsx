import { InSimFlags } from 'node-insim/packets';
import React from 'react';
import {
  ConnectionsProvider,
  createRoot,
  PlayersProvider,
} from 'react-node-insim';

import {
  ButtonExample,
  FlexExample,
  GridExample,
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
  <React.StrictMode>
    <PlayersProvider>
      <ConnectionsProvider>
        <PlayersAndConnectionsExample />
        <FlexExample />
        <ButtonExample />
        <GridExample />
        <StackExample />
        <ToggleButtonExample />
        <ToggleButtonGroupExample />
        <TextBoxExample />
      </ConnectionsProvider>
    </PlayersProvider>
  </React.StrictMode>,
);

process.on('uncaughtException', (error) => {
  console.log(error.message);
});
