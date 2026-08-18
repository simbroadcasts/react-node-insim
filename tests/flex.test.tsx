import Mitm from 'mitm';
import { InSim } from 'node-insim';
import { ButtonStyle, IS_BTN, IS_ISI } from 'node-insim/packets';
import type { ReactElement } from 'react';
import { describe, it } from 'vitest';

import { Button, createRoot, Flex } from '../src';
import {
  getTCPConnectionPromise,
  sendVersionPacket,
  wait,
} from './packetInterceptor';

async function renderFlex(flex: ReactElement) {
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
  root.render(flex);

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
    packetInterceptor,
    cleanup: () => {
      mitm.disable();
      inSim.disconnect();
    },
  };
}

describe('Flex', () => {
  it('should position children in a row using the yoga-computed layout', async () => {
    const { packetInterceptor, cleanup } = await renderFlex(
      <Flex top={10} left={20} width={100} height={50}>
        <Button width={20} height={10}>
          One
        </Button>
        <Button width={30} height={15}>
          Two
        </Button>
      </Flex>,
    );

    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        T: 10,
        L: 20,
        W: 20,
        H: 10,
        Text: 'One',
      }),
    );
    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 1,
        ReqI: 1,
        T: 10,
        L: 40,
        W: 30,
        H: 15,
        Text: 'Two',
      }),
    );
    await packetInterceptor.assertNoMoreData();

    cleanup();
  });

  it('should render a background filler button covering the whole flex area', async () => {
    const { packetInterceptor, cleanup } = await renderFlex(
      <Flex top={5} left={5} width={100} height={50} backgroundColor="dark">
        <Button width={20} height={10}>
          One
        </Button>
      </Flex>,
    );

    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        T: 5,
        L: 5,
        W: 100,
        H: 50,
        Text: '',
        BStyle: ButtonStyle.ISB_DARK,
      }),
    );
    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 1,
        ReqI: 1,
        T: 5,
        L: 5,
        W: 20,
        H: 10,
        Text: 'One',
      }),
    );
    await packetInterceptor.assertNoMoreData();

    cleanup();
  });

  it('should render 4 border filler buttons and shift children inside the border', async () => {
    const { packetInterceptor, cleanup } = await renderFlex(
      <Flex
        top={0}
        left={0}
        width={40}
        height={30}
        borderSize={2}
        borderColor="light"
      >
        <Button width={10} height={10}>
          One
        </Button>
      </Flex>,
    );

    // Left edge
    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        T: 0,
        L: 0,
        W: 2,
        H: 30,
        Text: '',
        BStyle: ButtonStyle.ISB_LIGHT,
      }),
    );
    // Right edge
    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 1,
        ReqI: 1,
        T: 0,
        L: 38,
        W: 2,
        H: 30,
        Text: '',
        BStyle: ButtonStyle.ISB_LIGHT,
      }),
    );
    // Top edge
    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 2,
        ReqI: 1,
        T: 0,
        L: 0,
        W: 40,
        H: 2,
        Text: '',
        BStyle: ButtonStyle.ISB_LIGHT,
      }),
    );
    // Bottom edge
    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 3,
        ReqI: 1,
        T: 28,
        L: 0,
        W: 40,
        H: 2,
        Text: '',
        BStyle: ButtonStyle.ISB_LIGHT,
      }),
    );
    // Child, shifted inside the border
    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 4,
        ReqI: 1,
        T: 2,
        L: 2,
        W: 10,
        H: 10,
        Text: 'One',
      }),
    );
    await packetInterceptor.assertNoMoreData();

    cleanup();
  });
});
