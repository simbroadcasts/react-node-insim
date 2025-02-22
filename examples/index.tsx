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
import { ButtonOperationsExample } from './apps/ButtonOperationsExample';

const host = process.env.HOST ?? '127.0.0.1';
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 29999;
const adminPassword = process.env.ADMIN ?? '';
const isLocal = isLocalIP(host);
const flags = isLocal ? InSimFlags.ISF_LOCAL : undefined;

const root = createRoot({
  name: 'React InSim',
  host,
  port,
  adminPassword,
  flags,
  // appendClickIDsInButtons: true,
  rootNodeStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    // width: 100,
    // height: 100,
  },
});

root.render(
  <StrictMode>
    <ConnectionsPlayersProvider>
      <ButtonOperationsExample />
      {/*<PlayersAndConnectionsExample />*/}
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

function isLocalIP(ip: string) {
  const localNetworks = [
    /^10\./, // 10.0.0.0 - 10.255.255.255 (Class A)
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0 - 172.31.255.255 (Class B)
    /^192\.168\./, // 192.168.0.0 - 192.168.255.255 (Class C)
    /^127\.0\.0\.1$/, // Loopback
    /^169\.254\./, // Link-local APIPA (Automatic Private IP Addressing)
  ];

  return localNetworks.some((regex) => regex.test(ip));
}
