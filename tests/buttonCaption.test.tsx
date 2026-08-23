import { IS_BTN } from 'node-insim/packets';
import { describe, expect, it } from 'vitest';

import { Button } from '../src';

describe('Button caption props', () => {
  it('should prefix the text with the caption when set', async () => {
    await expect(
      <Button width={20} height={5} caption="My caption">
        Hello
      </Button>,
    ).toSendButtonPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        W: 20,
        H: 5,
        Text: '\0My caption\0Hello',
      }),
    );
  });
});
