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

const host = process.env.HOST ?? '127.0.0.1';

const rootNode = Yoga.Node.create();
rootNode.setWidth(200);
rootNode.setHeight(200);
rootNode.setDisplay(Yoga.DISPLAY_FLEX);
rootNode.setFlexDirection(Yoga.FLEX_DIRECTION_ROW);
rootNode.setPositionType(Yoga.POSITION_TYPE_RELATIVE);
rootNode.setJustifyContent(Yoga.JUSTIFY_CENTER);
rootNode.setAlignItems(Yoga.ALIGN_CENTER);

const flexNode = Yoga.Node.create();
flexNode.setWidth(200);
flexNode.setHeight(50);
flexNode.setPositionType(Yoga.POSITION_TYPE_RELATIVE);
flexNode.setFlexDirection(Yoga.FLEX_DIRECTION_COLUMN);

const button1Node = Yoga.Node.create();
button1Node.setWidth(20);
button1Node.setHeight(10);

const button2Node = Yoga.Node.create();
button2Node.setWidth(20);
button2Node.setHeight(10);

flexNode.insertChild(button1Node, 0);
flexNode.insertChild(button2Node, 1);

rootNode.insertChild(flexNode, 0);

rootNode.calculateLayout();

// console.log('rootNode', rootNode.getComputedLayout());
// console.log('flexNode', flexNode.getComputedLayout());
// console.log('button1Node', button1Node.getComputedLayout());
// console.log('button2Node', button2Node.getComputedLayout());

function getAbsolutePosition(node: Yoga.YogaNode | null) {
  let left = 0;
  let top = 0;
  while (node) {
    const layout = node.getComputedLayout();
    left += layout.left;
    top += layout.top;
    node = node.getParent(); // Assume Yoga exposes a method to get the parent node
  }
  return { left, top };
}

console.log('absolute', getAbsolutePosition(button1Node));
console.log('absolute', getAbsolutePosition(button2Node));

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 29999;
const adminPassword = process.env.ADMIN ?? '';
const flags = host === '127.0.0.1' ? InSimFlags.ISF_LOCAL : undefined;

const root = createRoot({
  name: 'React InSim',
  host,
  port,
  adminPassword,
  flags,
  rootNodeStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
});

// root.render(
//   <>
//     <Button width={10} height={10}>
//       Hello
//     </Button>
//     <Button width={15} height={12}>
//       LFS
//     </Button>
//     <Button width={20} height={8}>
//       World
//     </Button>
//   </>,
// );

root.render(
  // TODO flex={1} results in 0 width
  // <>
  //   <Button flex={1} height={5}>
  //     Hello
  //   </Button>
  //   <Button flex={1} height={5}>
  //     World
  //   </Button>
  // </>,
  <Flex width="50%" height="50%">
    <Button margin={4} width={20} height={5}>
      hello
    </Button>
  </Flex>,
  //   // <Flex
  //   //   width={100}
  //   //   height={40}
  //   //   flexDirection="row"
  //   //   justifyContent="flex-end"
  //   //   alignItems="stretch"
  //   // >
  //   //   <Button flex={1} width={10} height={5}>
  //   //     Hello
  //   //   </Button>
  //   //   <Button flex={1} width={20} height={5}>
  //   //     World
  //   //   </Button>
  //   // </Flex>,
  //   // <>
  //   //   <Button width={20} height={5}>
  //   //     Hello
  //   //   </Button>
  //   //   <Button width={20} height={5}>
  //   //     World
  //   //   </Button>
  //   // </>,
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
