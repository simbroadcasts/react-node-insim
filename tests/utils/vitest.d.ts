import 'vitest';

import type { IS_BTN } from 'node-insim/packets';

import type { ToSendButtonPacketsOptions } from './customMatchers';

declare module 'vitest' {
  interface Matchers {
    toSendButtonPacket: (
      packets: IS_BTN,
      options?: ToSendButtonPacketsOptions = {},
    ) => Promise<void>;
    toSendButtonPackets: (
      packets: IS_BTN[],
      options?: ToSendButtonPacketsOptions = {},
    ) => Promise<void>;
  }
}
