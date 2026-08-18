import Mitm from 'mitm';
import { InSim } from 'node-insim';
import { ButtonStyle, IS_BTN, IS_ISI } from 'node-insim/packets';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Button, createRoot } from '../src';
import {
  getTCPConnectionPromise,
  sendButtonClickPacket,
  sendVersionPacket,
  wait,
} from './packetInterceptor';

async function renderButton(button: ReactElement) {
  const mitm = Mitm();
  const inSim = new InSim();
  const waitForTCPConnection = getTCPConnectionPromise(
    mitm,
    '127.0.0.1',
    29999,
  );

  inSim.connect({
    ReqI: 255,
    Host: '127.0.0.1',
    Port: 29999,
  });

  const root = createRoot(inSim);
  root.render(button);

  const { packetInterceptor, socket } = await waitForTCPConnection;

  await packetInterceptor.waitForPacket(
    new IS_ISI({
      ReqI: 255,
      InSimVer: 10,
    }),
  );

  await wait(10);
  await sendVersionPacket({ socket, ReqI: 255 });

  return {
    inSim,
    socket,
    packetInterceptor,
    cleanup: () => {
      mitm.disable();
      inSim.disconnect();
    },
  };
}

describe('Button onClick event listener', () => {
  it('should call onClick when a matching IS_BTC packet is received', async () => {
    const onClick = vi.fn();
    const { inSim, socket, packetInterceptor, cleanup } = await renderButton(
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
    const { socket, packetInterceptor, cleanup } = await renderButton(
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
    const { socket, packetInterceptor, cleanup } = await renderButton(
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
    const { socket, packetInterceptor, cleanup } = await renderButton(
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
