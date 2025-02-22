import type { InSim } from 'node-insim';
import { PacketType } from 'node-insim/packets';
import Yoga from 'yoga-layout-prebuilt';

import { log } from '../../../internals/logger';
import applyStyles, { type StyleProps } from '../styleProps';
import type { Children } from '../types';
import { BaseElement } from './BaseElement';

export class RootElement extends BaseElement {
  readonly id: string;
  pendingChildren: Children;
  readonly inSim: InSim;

  /**
   * ClickID1: [UCID1, UCID2,      , UCID4]
   * ClickID2: [UCID1, UCID2, UCID3, UCID4]
   * ClickID2: [              UCID3, UCID4]
   */
  buttonUCIDsByClickID: Set<number>[];
  buttonClickIDStart: number;
  appendClickIDsInButtons: boolean;

  constructor(
    id: string,
    inSim: InSim,
    nodeStyle?: StyleProps,
    buttonClickIDStart = 0,
    appendClickIDsInButtons = false,
  ) {
    const node = Yoga.Node.create();

    applyStyles(node, {
      width: 200,
      height: 200,
      flexDirection: 'row',
      flexWrap: 'wrap',
      ...nodeStyle,
    });
    super('root', node);

    this.id = id;
    this.inSim = inSim;
    this.children = [];
    this.pendingChildren = [];
    this.inSim = inSim;
    this.buttonUCIDsByClickID = [];
    this.buttonClickIDStart = buttonClickIDStart;
    this.appendClickIDsInButtons = appendClickIDsInButtons;

    // When a connection leaves, remove their UCID from all buttons
    inSim.on(PacketType.ISP_CNL, (packet) => {
      this.buttonUCIDsByClickID.forEach((ucIds, clickID) => {
        if (ucIds.has(packet.UCID)) {
          log(`removing UCID ${packet.UCID} from clickID ${clickID}`);
          ucIds.delete(packet.UCID);
        }
      });
    });
  }
}
