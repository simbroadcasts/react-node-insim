import { IS_BTN } from 'node-insim/packets';
import { describe, it } from 'vitest';

import { Button } from '../src';
import { renderInSimButtons } from './renderInSimButtons';

describe('Buttons', () => {
  it('should send a button', async () => {
    const { packetInterceptor, cleanup } = await renderInSimButtons(
      <Button width={20} height={5}>
        Hello world
      </Button>,
    );

    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        W: 20,
        H: 5,
        Text: 'Hello world',
      }),
    );

    cleanup();
  });

  it('should send multiple buttons with incremental unique ClickIDs', async () => {
    const { packetInterceptor, cleanup } = await renderInSimButtons(
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
      { handshakeWaitMs: 50 },
    );

    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        W: 20,
        H: 5,
        Text: 'One',
      }),
    );
    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 1,
        ReqI: 1,
        T: 20,
        L: 50,
        W: 40,
        H: 10,
        Text: 'Two',
      }),
    );
    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 2,
        ReqI: 1,
        T: 30,
        L: 60,
        W: 10,
        H: 5,
        Text: 'Three',
      }),
    );
    await packetInterceptor.assertNoMoreData();

    cleanup();
  });
});
