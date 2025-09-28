import './env';

import { InSim } from 'node-insim';
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

const inSim = new InSim();

inSim.connect({
  IName: 'React InSim',
  ReqI: 1,
  Host: host,
  Port: process.env.PORT ? parseInt(process.env.PORT, 10) : 29999,
  Admin: process.env.ADMIN ?? '',
  Flags: InSimFlags.ISF_LOCAL,
});

const root = createRoot(inSim);

root.render(
  <StrictMode>
    <ConnectionsPlayersProvider>
      <PlayersAndConnectionsExample />
      {/*<ScopesExample />*/}
      {/*<PacketHooksExample />*/}
      {/*<FlexExample isEditorVisible={false} />*/}
      {/*<ButtonExample />*/}
      {/*<GridExample />*/}
      {/*<StackExample />*/}
      {/*<ToggleButtonExample />*/}
      {/*<ToggleButtonGroupExample />*/}
      {/*<TextBoxExample />*/}
    </ConnectionsPlayersProvider>
  </StrictMode>,
);

process.on('uncaughtException', (error) => {
  console.log(error.message);
});
