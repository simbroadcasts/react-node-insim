import { ButtonStyle, IS_BTN, TypeIn } from 'node-insim/packets';
import { describe, it } from 'vitest';

import { Button } from '../src';
import { renderInSimButtons } from './renderInSimButtons';

describe('Button type in', () => {
  it('should set TypeIn to maxTypeInChars when onType is provided', async () => {
    const { packetInterceptor, cleanup } = await renderInSimButtons(
      <Button width={20} height={5} onType={() => {}} maxTypeInChars={42}>
        Hello
      </Button>,
    );

    await packetInterceptor.waitForPacket(
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
    await packetInterceptor.assertNoMoreData();

    cleanup();
  });

  it('should not set TypeIn when onType is not provided, even if maxTypeInChars is set', async () => {
    const { packetInterceptor, cleanup } = await renderInSimButtons(
      <Button width={20} height={5} maxTypeInChars={42}>
        Hello
      </Button>,
    );

    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        W: 20,
        H: 5,
        Text: 'Hello',
        TypeIn: 0,
      }),
    );
    await packetInterceptor.assertNoMoreData();

    cleanup();
  });

  it('should add INIT_VALUE_BUTTON_TEXT to TypeIn when initializeDialogWithButtonText is set', async () => {
    const { packetInterceptor, cleanup } = await renderInSimButtons(
      <Button
        width={20}
        height={5}
        onType={() => {}}
        maxTypeInChars={42}
        initializeDialogWithButtonText
      >
        Hello
      </Button>,
    );

    await packetInterceptor.waitForPacket(
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
    await packetInterceptor.assertNoMoreData();

    cleanup();
  });
});
