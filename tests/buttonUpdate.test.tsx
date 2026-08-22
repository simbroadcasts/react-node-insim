import { ButtonFunction, IS_BFN, IS_BTN } from 'node-insim/packets';
import { describe, it } from 'vitest';

import { Button } from '../src';
import { renderInSimButtons } from './renderInSimButtons';

describe('Button updates', () => {
  it('should send an updated button when only its text changes', async () => {
    const { root, packetInterceptor, cleanup } = await renderInSimButtons(
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

    root.render(
      <Button width={20} height={5}>
        Updated text
      </Button>,
    );

    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        W: 0,
        H: 0,
        Text: 'Updated text',
      }),
    );
    await packetInterceptor.assertNoMoreData();

    cleanup();
  });

  it('should send a full button update when its dimensions change', async () => {
    const { root, packetInterceptor, cleanup } = await renderInSimButtons(
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

    root.render(
      <Button top={20} left={50} width={40} height={10}>
        Hello world
      </Button>,
    );

    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        T: 20,
        L: 50,
        W: 40,
        H: 10,
        Text: 'Hello world',
      }),
    );
    await packetInterceptor.assertNoMoreData();

    cleanup();
  });

  it('should delete a button when it is unmounted, freeing its ClickID', async () => {
    const { root, packetInterceptor, cleanup } = await renderInSimButtons(
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

    root.render(null);

    await packetInterceptor.waitForPacket(
      new IS_BFN({
        SubT: ButtonFunction.BFN_DEL_BTN,
        ClickID: 0,
        UCID: 0,
      }),
    );
    await packetInterceptor.assertNoMoreData();

    root.render(
      <Button width={30} height={8}>
        New button
      </Button>,
    );

    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        W: 30,
        H: 8,
        Text: 'New button',
      }),
    );
    await packetInterceptor.assertNoMoreData();

    cleanup();
  });
});
