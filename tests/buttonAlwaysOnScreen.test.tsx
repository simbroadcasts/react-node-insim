import { IS_BTN } from 'node-insim/packets';
import { describe, expect, it } from 'vitest';

import { Button } from '../src';

describe('Button always on screen', () => {
  it('should set Inst to INST_ALWAYS_ON when isAlwaysOnScreen is set', async () => {
    await expect(
      <Button width={20} height={5} isAlwaysOnScreen>
        Hello
      </Button>,
    ).toSendButtonPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        W: 20,
        H: 5,
        Text: 'Hello',
        Inst: IS_BTN.INST_ALWAYS_ON,
      }),
    );
  });

  it('should not set Inst when isAlwaysOnScreen is not set', async () => {
    await expect(
      <Button width={20} height={5}>
        Hello
      </Button>,
    ).toSendButtonPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        W: 20,
        H: 5,
        Text: 'Hello',
        Inst: 0,
      }),
    );
  });
});
