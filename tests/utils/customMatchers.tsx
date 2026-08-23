import { IS_BTN } from 'node-insim/packets';
import { isValidElement } from 'react';
import unicodeToLfs from 'unicode-to-lfs';
import type { Matcher, MatcherState } from 'vitest';
import { expect } from 'vitest';

import type { RenderInSimButtonsOptions } from './renderInSimButtons';
import { renderInSimButtons } from './renderInSimButtons';

const IS_BTN_FIXED_DATA_SIZE = 12; // TODO extract from node-insim

export type ToSendButtonPacketsOptions = RenderInSimButtonsOptions & {
  assertNoMoreData?: boolean;
};

const toSendButtonPacket: Matcher<
  MatcherState,
  [arg1: IS_BTN, arg2?: ToSendButtonPacketsOptions]
> = async function (receivedButtons, expectedPacket, options = {}) {
  return toSendButtonPackets.call(
    this,
    receivedButtons,
    [expectedPacket],
    options,
  );
};

const toSendButtonPackets: Matcher<
  MatcherState,
  [arg1: IS_BTN[], arg2?: ToSendButtonPacketsOptions]
> = async function (receivedButtons, expectedPackets, options = {}) {
  const { isNot, equals, utils } = this;
  const { assertNoMoreData = true, ...renderOptions } = options;

  if (!isValidElement(receivedButtons)) {
    return {
      pass: false,
      message: () =>
        `Expected a valid React element, but received ${utils.printReceived(receivedButtons)}`,
    };
  }

  const { packetInterceptor, cleanup } = await renderInSimButtons(
    receivedButtons,
    renderOptions,
  );

  const notMatchedPackets: { expected: IS_BTN; actual: IS_BTN }[] = [];

  for (const packet of expectedPackets) {
    const packetBuffer = await packetInterceptor.waitForPacket(packet);
    const packetSize = packetBuffer[0] * new IS_BTN().SIZE_MULTIPLIER;
    const textLength = packetSize - IS_BTN_FIXED_DATA_SIZE;

    const actualPacket = new IS_BTN().unpack(packetBuffer, {
      Text: `${textLength}s`,
    });

    if (!equals(packetBuffer, packet.pack())) {
      notMatchedPackets.push({
        expected: packet,
        actual: actualPacket,
      });
    }
  }

  let noMoreDataError: Error | null = null;

  if (assertNoMoreData) {
    try {
      await packetInterceptor.assertNoMoreData();
    } catch (error) {
      noMoreDataError = error as Error;
    }
  }

  const pass = notMatchedPackets.length === 0 && !noMoreDataError;

  cleanup();

  return {
    pass,
    message: () => {
      if (noMoreDataError) {
        return noMoreDataError.message;
      }

      return `Expected buttons
${utils.EXPECTED_COLOR(utils.stringify(receivedButtons))} ${isNot ? ' not' : ''}
to send these InSim packets:
${JSON.stringify(expectedPackets.map(removeRawPropsFromButtonPacket), null, 2)}`;
    },
    expected: notMatchedPackets.map(({ expected }) => {
      const multiple = 4;
      const MAX_LENGTH = 240; // TODO extract from node-insim
      const encodedText = unicodeToLfs(expected.Text);
      const length = encodedText.length;
      const textSize = Math.min(
        length + (multiple - (length % multiple)),
        MAX_LENGTH,
      );
      const size = IS_BTN_FIXED_DATA_SIZE + textSize;

      return {
        ...removeRawPropsFromButtonPacket(expected),
        Size: size,
      };
    }),
    actual: notMatchedPackets.map(({ actual }) =>
      removeRawPropsFromButtonPacket(actual),
    ),
  };
};

expect.extend({
  toSendButtonPacket,
  toSendButtonPackets,
});

function removeRawPropsFromButtonPacket({
  _raw,
  SIZE_MULTIPLIER: _,
  ...packet
}: IS_BTN) {
  return packet;
}
