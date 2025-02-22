import './env';

import { InSimFlags } from 'node-insim/packets';
import React, { StrictMode } from 'react';
import { ConnectionsPlayersProvider, createRoot } from 'react-node-insim';
import Yoga from 'yoga-layout-prebuilt';

import { Button } from '../src/lib/components/Button';
import { Flex } from '../src/lib/components/layout/Flex';
import { log } from '../src/lib/internals/logger';
import applyStyles from '../src/lib/renderer/inSim/styleProps';
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

// const rootNode = Yoga.Node.create();
// rootNode.setWidth(200);
// rootNode.setHeight(200);
// rootNode.setDisplay(Yoga.DISPLAY_FLEX);
// rootNode.setFlexDirection(Yoga.FLEX_DIRECTION_ROW);
// rootNode.setPositionType(Yoga.POSITION_TYPE_RELATIVE);
// rootNode.setJustifyContent(Yoga.JUSTIFY_CENTER);
// rootNode.setAlignItems(Yoga.ALIGN_CENTER);
//
// const flexNode = Yoga.Node.create();
// flexNode.setWidth(200);
// flexNode.setHeight(50);
// flexNode.setPositionType(Yoga.POSITION_TYPE_RELATIVE);
// flexNode.setFlexDirection(Yoga.FLEX_DIRECTION_COLUMN);
//
// const button1Node = Yoga.Node.create();
// button1Node.setWidth(20);
// button1Node.setHeight(10);
//
// const button2Node = Yoga.Node.create();
// button2Node.setWidth(20);
// button2Node.setHeight(10);
//
// flexNode.insertChild(button1Node, 0);
// flexNode.insertChild(button2Node, 1);
//
// rootNode.insertChild(flexNode, 0);
//
// rootNode.calculateLayout();

// console.log('rootNode', rootNode.getComputedLayout());
// console.log('flexNode', flexNode.getComputedLayout());
// console.log('button1Node', button1Node.getComputedLayout());
// console.log('button2Node', button2Node.getComputedLayout());

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
  // appendButtonIDs: true,
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
