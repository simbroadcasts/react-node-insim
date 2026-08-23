import { IS_BTN } from 'node-insim/packets';
import { describe, expect, it } from 'vitest';

import { Button } from '../src';

describe('Button ClickID allocation', () => {
  it('should reuse the same ClickID for buttons with different UCIDs', async () => {
    await expect(
      <>
        <Button UCID={1} width={20} height={5}>
          A
        </Button>
        <Button UCID={2} width={20} height={5}>
          B
        </Button>
      </>,
    ).toSendButtonPackets(
      [
        new IS_BTN({ ClickID: 0, ReqI: 1, UCID: 1, W: 20, H: 5, Text: 'A' }),
        new IS_BTN({ ClickID: 0, ReqI: 1, UCID: 2, W: 20, H: 5, Text: 'B' }),
      ],
    );
  });

  it('should allocate different ClickIDs for buttons with the same UCID', async () => {
    await expect(
      <>
        <Button UCID={5} width={20} height={5}>
          A
        </Button>
        <Button UCID={5} width={20} height={5}>
          B
        </Button>
      </>,
    ).toSendButtonPackets(
      [
        new IS_BTN({ ClickID: 0, ReqI: 1, UCID: 5, W: 20, H: 5, Text: 'A' }),
        new IS_BTN({ ClickID: 1, ReqI: 1, UCID: 5, W: 20, H: 5, Text: 'B' }),
      ],
    );
  });

  it('should only allocate a fully free ClickID for a UCID=255 (all) button, and keep it reserved for later buttons', async () => {
    await expect(
      <>
        <Button UCID={1} width={20} height={5}>
          A
        </Button>
        <Button UCID={255} width={20} height={5}>
          B
        </Button>
        <Button UCID={2} width={20} height={5}>
          C
        </Button>
      </>,
    ).toSendButtonPackets(
      [
        // A takes the first (empty) slot.
        new IS_BTN({ ClickID: 0, ReqI: 1, UCID: 1, W: 20, H: 5, Text: 'A' }),
        // B (all connections) cannot reuse A's slot, since it isn't empty - a
        // new slot is allocated instead.
        new IS_BTN({ ClickID: 1, ReqI: 1, UCID: 255, W: 20, H: 5, Text: 'B' }),
        // C can reuse A's slot, since UCID 2 isn't in it yet.
        new IS_BTN({ ClickID: 0, ReqI: 1, UCID: 2, W: 20, H: 5, Text: 'C' }),
      ],
    );
  });

  it('should offset allocated ClickIDs by buttonClickIDStart', async () => {
    await expect(
      <Button width={20} height={5}>
        Hello
      </Button>,
    ).toSendButtonPacket(
      new IS_BTN({ ClickID: 10, ReqI: 1, W: 20, H: 5, Text: 'Hello' }),
      { createRootOptions: { buttonClickIDStart: 10 } },
    );
  });
});
