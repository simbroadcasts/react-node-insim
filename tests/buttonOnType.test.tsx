import { ButtonStyle, IS_BTN } from 'node-insim/packets';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Button, createRoot } from '../src';
import {
  beginInSimConnection,
  connectAndCompleteHandshake,
  sendButtonTypePacket,
  wait,
} from './packetInterceptor';

async function renderButton(button: ReactElement) {
  const { inSim, waitForTCPConnection, cleanup } = beginInSimConnection();

  const root = createRoot(inSim);
  root.render(button);

  const { packetInterceptor, socket } =
    await connectAndCompleteHandshake(waitForTCPConnection);

  return { inSim, socket, packetInterceptor, cleanup };
}

describe('Button onType event listener', () => {
  it('should call onType when a matching IS_BTT packet is received', async () => {
    const onType = vi.fn();
    const { inSim, socket, packetInterceptor, cleanup } = await renderButton(
      <Button UCID={1} width={20} height={5} onType={onType}>
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
        TypeIn: 95,
        BStyle: ButtonStyle.ISB_CLICK,
      }),
    );

    await sendButtonTypePacket(socket, {
      ReqI: 1,
      UCID: 1,
      ClickID: 0,
      TypeIn: 95,
      Text: 'typed value',
    });
    await wait(20);

    expect(onType).toHaveBeenCalledTimes(1);
    expect(onType).toHaveBeenCalledWith(
      expect.objectContaining({
        ClickID: 0,
        UCID: 1,
        Text: 'typed value',
      }),
      inSim,
    );

    cleanup();
  });

  it('should not call onType when the ClickID does not match', async () => {
    const onType = vi.fn();
    const { socket, packetInterceptor, cleanup } = await renderButton(
      <Button UCID={1} width={20} height={5} onType={onType}>
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
        TypeIn: 95,
        BStyle: ButtonStyle.ISB_CLICK,
      }),
    );

    await sendButtonTypePacket(socket, {
      ReqI: 1,
      UCID: 1,
      ClickID: 5,
      TypeIn: 95,
      Text: 'typed value',
    });
    await wait(20);

    expect(onType).not.toHaveBeenCalled();

    cleanup();
  });

  it('should not call onType when the UCID does not match', async () => {
    const onType = vi.fn();
    const { socket, packetInterceptor, cleanup } = await renderButton(
      <Button UCID={1} width={20} height={5} onType={onType}>
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
        TypeIn: 95,
        BStyle: ButtonStyle.ISB_CLICK,
      }),
    );

    await sendButtonTypePacket(socket, {
      ReqI: 1,
      UCID: 2,
      ClickID: 0,
      TypeIn: 95,
      Text: 'typed value',
    });
    await wait(20);

    expect(onType).not.toHaveBeenCalled();

    cleanup();
  });
});
