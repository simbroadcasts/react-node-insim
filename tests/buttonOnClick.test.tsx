import { ButtonStyle, IS_BTN } from 'node-insim/packets';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../src';
import { sendButtonClickPacket, wait } from './packetInterceptor';
import { renderInSimButtons } from './renderInSimButtons';

describe('Button onClick event listener', () => {
  it('should call onClick when a matching IS_BTC packet is received', async () => {
    const onClick = vi.fn();
    const { inSim, socket, packetInterceptor, cleanup } =
      await renderInSimButtons(
        <Button UCID={1} width={20} height={5} onClick={onClick}>
          Hello
        </Button>,
      );

    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        UCID: 1,
        W: 20,
        H: 5,
        Text: 'Hello',
        BStyle: ButtonStyle.ISB_CLICK,
      }),
    );

    await sendButtonClickPacket(socket, { ReqI: 1, UCID: 1, ClickID: 0 });
    await wait(20);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({ ClickID: 0, UCID: 1 }),
      inSim,
    );

    cleanup();
  });

  it('should not call onClick when the ClickID does not match', async () => {
    const onClick = vi.fn();
    const { socket, packetInterceptor, cleanup } = await renderInSimButtons(
      <Button UCID={1} width={20} height={5} onClick={onClick}>
        Hello
      </Button>,
    );

    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        UCID: 1,
        W: 20,
        H: 5,
        Text: 'Hello',
        BStyle: ButtonStyle.ISB_CLICK,
      }),
    );

    await sendButtonClickPacket(socket, { ReqI: 1, UCID: 1, ClickID: 5 });
    await wait(20);

    expect(onClick).not.toHaveBeenCalled();

    cleanup();
  });

  it('should not call onClick when the UCID does not match', async () => {
    const onClick = vi.fn();
    const { socket, packetInterceptor, cleanup } = await renderInSimButtons(
      <Button UCID={1} width={20} height={5} onClick={onClick}>
        Hello
      </Button>,
    );

    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        UCID: 1,
        W: 20,
        H: 5,
        Text: 'Hello',
        BStyle: ButtonStyle.ISB_CLICK,
      }),
    );

    await sendButtonClickPacket(socket, { ReqI: 1, UCID: 2, ClickID: 0 });
    await wait(20);

    expect(onClick).not.toHaveBeenCalled();

    cleanup();
  });

  it('should call onClick for any UCID when the button UCID is 255 (all)', async () => {
    const onClick = vi.fn();
    const { socket, packetInterceptor, cleanup } = await renderInSimButtons(
      <Button UCID={255} width={20} height={5} onClick={onClick}>
        Hello
      </Button>,
    );

    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        UCID: 255,
        W: 20,
        H: 5,
        Text: 'Hello',
        BStyle: ButtonStyle.ISB_CLICK,
      }),
    );

    await sendButtonClickPacket(socket, { ReqI: 1, UCID: 7, ClickID: 0 });
    await wait(20);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({ ClickID: 0, UCID: 7 }),
      expect.anything(),
    );

    cleanup();
  });
});
