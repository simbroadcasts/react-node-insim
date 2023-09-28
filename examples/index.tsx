import { InSimFlags } from 'node-insim/packets';
import React from 'react';
import {
  ConnectionsProvider,
  createRoot,
  PlayersProvider,
} from 'react-node-insim';

import {
  ButtonTypeIn,
  FlexLayout,
  GridLayout,
  PlayersAndConnectionsButtons,
  StackLayout,
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
        <PlayersAndConnectionsButtons />
        <FlexLayout showFlexPropsEditor={false} />
        <GridLayout />
        <StackLayout />
        <ButtonTypeIn />
      </ConnectionsProvider>
    </PlayersProvider>
  </React.StrictMode>,
);

process.on('uncaughtException', (error) => {
  console.log(error.message);
});
