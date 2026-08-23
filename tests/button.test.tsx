import { IS_BTN } from 'node-insim/packets';
import { describe, expect, it } from 'vitest';

import { Button } from '../src';

describe('Buttons', () => {
  it('should send a button', async () => {
    await expect(
      <Button width={20} height={5}>
        Hello world
      </Button>,
    ).toSendButtonPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        W: 20,
        H: 5,
        Text: 'Hello world',
      }),
    );
  });

  it('should send multiple buttons with incremental unique ClickIDs', async () => {
    await expect(
      <>
        <Button width={20} height={5}>
          One
        </Button>
        <Button top={20} left={50} width={40} height={10}>
          Two
        </Button>
        <Button top={30} left={60} width={10} height={5}>
          Three
        </Button>
      </>,
    ).toSendButtonPackets(
      [
        new IS_BTN({
          ClickID: 0,
          ReqI: 1,
          W: 20,
          H: 5,
          Text: 'One',
        }),
        new IS_BTN({
          ClickID: 1,
          ReqI: 1,
          T: 20,
          L: 50,
          W: 40,
          H: 10,
          Text: 'Two',
        }),
        new IS_BTN({
          ClickID: 2,
          ReqI: 1,
          T: 30,
          L: 60,
          W: 10,
          H: 5,
          Text: 'Three',
        }),
      ],
      { handshakeWaitMs: 50 },
    );
  });
});
