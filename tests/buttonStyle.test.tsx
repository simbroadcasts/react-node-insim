import { ButtonStyle, ButtonTextColour, IS_BTN } from 'node-insim/packets';
import { describe, expect, it } from 'vitest';

import { Button } from '../src';

describe('Button styling', () => {
  describe('text align', () => {
    it.each([
      { align: undefined, expectedBStyle: 0 },
      { align: 'left' as const, expectedBStyle: ButtonStyle.ISB_LEFT },
      { align: 'right' as const, expectedBStyle: ButtonStyle.ISB_RIGHT },
    ])(
      'should set BStyle $expectedBStyle for align=$align',
      async ({ align, expectedBStyle }) => {
        await expect(
          <Button width={20} height={5} align={align}>
            Hello
          </Button>,
        ).toSendButtonPacket(
          new IS_BTN({
            ClickID: 0,
            ReqI: 1,
            W: 20,
            H: 5,
            Text: 'Hello',
            BStyle: expectedBStyle,
          }),
        );
      },
    );
  });

  describe('semantic text colors', () => {
    it.each([
      {
        color: 'default' as const,
        expectedBStyle: ButtonTextColour.LIGHT_GREY,
      },
      {
        color: 'title' as const,
        expectedBStyle: ButtonTextColour.TITLE_COLOUR,
      },
      {
        color: 'unselected' as const,
        expectedBStyle: ButtonTextColour.UNSELECTED_TEXT,
      },
      {
        color: 'selected' as const,
        expectedBStyle: ButtonTextColour.SELECTED_TEXT,
      },
      { color: 'ok' as const, expectedBStyle: ButtonTextColour.OK },
      { color: 'cancel' as const, expectedBStyle: ButtonTextColour.CANCEL },
      {
        color: 'textstring' as const,
        expectedBStyle: ButtonTextColour.TEXT_STRING,
      },
      {
        color: 'unavailable' as const,
        expectedBStyle: ButtonTextColour.UNAVAILABLE,
      },
    ])(
      'should set BStyle $expectedBStyle for color=$color',
      async ({ color, expectedBStyle }) => {
        await expect(
          <Button width={20} height={5} color={color}>
            Hello
          </Button>,
        ).toSendButtonPacket(
          new IS_BTN({
            ClickID: 0,
            ReqI: 1,
            W: 20,
            H: 5,
            Text: 'Hello',
            BStyle: expectedBStyle,
          }),
        );
      },
    );
  });

  describe('LFS palette text colors', () => {
    it.each([
      { color: 'black' as const, index: 0 },
      { color: 'red' as const, index: 1 },
      { color: 'green' as const, index: 2 },
      { color: 'yellow' as const, index: 3 },
      { color: 'blue' as const, index: 4 },
      { color: 'magenta' as const, index: 5 },
      { color: 'cyan' as const, index: 6 },
      { color: 'white' as const, index: 7 },
    ])(
      'should prefix the text with ^$index for color=$color without setting a BStyle bit',
      async ({ color, index }) => {
        await expect(
          <Button width={20} height={5} color={color}>
            Hello
          </Button>,
        ).toSendButtonPacket(
          new IS_BTN({
            ClickID: 0,
            ReqI: 1,
            W: 20,
            H: 5,
            Text: `^${index}Hello`,
            BStyle: 0,
          }),
        );
      },
    );
  });

  describe('background colors', () => {
    it.each([
      { background: 'transparent' as const, expectedBStyle: 0 },
      { background: 'light' as const, expectedBStyle: ButtonStyle.ISB_LIGHT },
      { background: 'dark' as const, expectedBStyle: ButtonStyle.ISB_DARK },
    ])(
      'should set BStyle $expectedBStyle for background=$background',
      async ({ background, expectedBStyle }) => {
        await expect(
          <Button width={20} height={5} background={background}>
            Hello
          </Button>,
        ).toSendButtonPacket(
          new IS_BTN({
            ClickID: 0,
            ReqI: 1,
            W: 20,
            H: 5,
            Text: 'Hello',
            BStyle: expectedBStyle,
          }),
        );
      },
    );
  });

  describe('variants', () => {
    it('should apply the light variant color and background when neither is set explicitly', async () => {
      await expect(
        <Button width={20} height={5} variant="light">
          Hello
        </Button>,
      ).toSendButtonPacket(
        new IS_BTN({
          ClickID: 0,
          ReqI: 1,
          W: 20,
          H: 5,
          Text: 'Hello',
          BStyle: ButtonTextColour.UNSELECTED_TEXT | ButtonStyle.ISB_LIGHT,
        }),
      );
    });

    it('should apply the dark variant color and background when neither is set explicitly', async () => {
      await expect(
        <Button width={20} height={5} variant="dark">
          Hello
        </Button>,
      ).toSendButtonPacket(
        new IS_BTN({
          ClickID: 0,
          ReqI: 1,
          W: 20,
          H: 5,
          Text: 'Hello',
          BStyle: ButtonTextColour.LIGHT_GREY | ButtonStyle.ISB_DARK,
        }),
      );
    });

    it('should let an explicit color override the variant color, keeping the variant background', async () => {
      await expect(
        <Button width={20} height={5} variant="light" color="ok">
          Hello
        </Button>,
      ).toSendButtonPacket(
        new IS_BTN({
          ClickID: 0,
          ReqI: 1,
          W: 20,
          H: 5,
          Text: 'Hello',
          BStyle: ButtonTextColour.OK | ButtonStyle.ISB_LIGHT,
        }),
      );
    });

    it('should let an explicit background override the variant background, keeping the variant color', async () => {
      await expect(
        <Button width={20} height={5} variant="dark" background="transparent">
          Hello
        </Button>,
      ).toSendButtonPacket(
        new IS_BTN({
          ClickID: 0,
          ReqI: 1,
          W: 20,
          H: 5,
          Text: 'Hello',
          BStyle: ButtonTextColour.LIGHT_GREY,
        }),
      );
    });
  });

  describe('disabled buttons', () => {
    it('should set the UNAVAILABLE text colour and not be clickable', async () => {
      await expect(
        <Button width={20} height={5} isDisabled>
          Hello
        </Button>,
      ).toSendButtonPacket(
        new IS_BTN({
          ClickID: 0,
          ReqI: 1,
          W: 20,
          H: 5,
          Text: 'Hello',
          BStyle: ButtonTextColour.UNAVAILABLE,
        }),
      );
    });

    it('should not set ISB_CLICK even when onClick is provided', async () => {
      await expect(
        <Button width={20} height={5} isDisabled onClick={() => {}}>
          Hello
        </Button>,
      ).toSendButtonPacket(
        new IS_BTN({
          ClickID: 0,
          ReqI: 1,
          W: 20,
          H: 5,
          Text: 'Hello',
          BStyle: ButtonTextColour.UNAVAILABLE,
        }),
      );
    });
  });
});
