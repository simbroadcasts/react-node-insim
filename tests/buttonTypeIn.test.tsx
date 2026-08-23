import { ButtonStyle, IS_BTN, TypeIn } from 'node-insim/packets';
import { describe, expect, it } from 'vitest';

import { Button } from '../src';

describe('Button type in', () => {
  it('should set TypeIn to maxTypeInChars when onType is provided', async () => {
    await expect(
      <Button width={20} height={5} onType={() => {}} maxTypeInChars={42}>
        Hello
      </Button>,
    ).toSendButtonPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        W: 20,
        H: 5,
        Text: 'Hello',
        TypeIn: 42,
        BStyle: ButtonStyle.ISB_CLICK,
      }),
    );
  });

  it('should not set TypeIn when onType is not provided, even if maxTypeInChars is set', async () => {
    await expect(
      <Button width={20} height={5} maxTypeInChars={42}>
        Hello
      </Button>,
    ).toSendButtonPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        W: 20,
        H: 5,
        Text: 'Hello',
        TypeIn: 0,
      }),
    );
  });

  it('should add INIT_VALUE_BUTTON_TEXT to TypeIn when initializeDialogWithButtonText is set', async () => {
    await expect(
      <Button
        width={20}
        height={5}
        onType={() => {}}
        maxTypeInChars={42}
        initializeDialogWithButtonText
      >
        Hello
      </Button>,
    ).toSendButtonPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        W: 20,
        H: 5,
        Text: 'Hello',
        TypeIn: 42 + TypeIn.INIT_VALUE_BUTTON_TEXT,
        BStyle: ButtonStyle.ISB_CLICK,
      }),
    );
  });
});
