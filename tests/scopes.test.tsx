import Mitm from 'mitm';
import { InSim } from 'node-insim';
import {
  IS_BTN,
  IS_ISI,
  IS_TINY,
  PlayerType,
  TinyType,
} from 'node-insim/packets';
import type { ReactElement } from 'react';
import { describe, it } from 'vitest';

import {
  Button,
  ConnectionScopeProvider,
  createRoot,
  GlobalScopeProvider,
  HumanPlayerScopeProvider,
} from '../src';
import {
  getTCPConnectionPromise,
  sendNewConnectionPacket,
  sendNewPlayerPacket,
  sendVersionPacket,
  wait,
} from './packetInterceptor';

async function renderScoped(children: ReactElement) {
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
  root.render(children);

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
    socket,
    packetInterceptor,
    cleanup: () => {
      mitm.disable();
      inSim.disconnect();
    },
  };
}

// ConnectionScopeProvider (and HumanPlayerScopeProvider, which wraps it)
// mount a ConnectionsPlayersProvider, which requests a full connection/player
// dump as soon as it connects.
async function consumeConnectionsPlayersDumpRequest(
  packetInterceptor: Awaited<
    ReturnType<typeof renderScoped>
  >['packetInterceptor'],
) {
  await packetInterceptor.waitForPacket(
    new IS_TINY({ ReqI: 1, SubT: TinyType.TINY_NCN }),
  );
  await packetInterceptor.waitForPacket(
    new IS_TINY({ ReqI: 1, SubT: TinyType.TINY_NPL }),
  );
}

describe('Scope providers', () => {
  it('should render a single UCID=255 button for GlobalScopeProvider, regardless of connections', async () => {
    const { packetInterceptor, cleanup } = await renderScoped(
      <GlobalScopeProvider>
        <Button width={20} height={5}>
          Hello
        </Button>
      </GlobalScopeProvider>,
    );

    await packetInterceptor.waitForPacket(
      new IS_BTN({
        ClickID: 0,
        ReqI: 1,
        UCID: 255,
        W: 20,
        H: 5,
        Text: 'Hello',
      }),
    );
    await packetInterceptor.assertNoMoreData();

    cleanup();
  });

  it('should render one button per non-host connection for ConnectionScopeProvider', async () => {
    const { socket, packetInterceptor, cleanup } = await renderScoped(
      <ConnectionScopeProvider>
        <Button width={20} height={5}>
          Hello
        </Button>
      </ConnectionScopeProvider>,
    );

    await consumeConnectionsPlayersDumpRequest(packetInterceptor);

    // The host (UCID 0) must not get a button.
    await sendNewConnectionPacket(socket, { UCID: 0 });
    await sendNewConnectionPacket(socket, { UCID: 1 });
    await sendNewConnectionPacket(socket, { UCID: 2 });

    await packetInterceptor.waitForPacket(
      new IS_BTN({ ClickID: 0, ReqI: 1, UCID: 1, W: 20, H: 5, Text: 'Hello' }),
    );
    await packetInterceptor.waitForPacket(
      new IS_BTN({ ClickID: 0, ReqI: 1, UCID: 2, W: 20, H: 5, Text: 'Hello' }),
    );
    await packetInterceptor.assertNoMoreData();

    cleanup();
  });

  it('should render a button for a connection with a human player, using the player scope', async () => {
    const { socket, packetInterceptor, cleanup } = await renderScoped(
      <HumanPlayerScopeProvider>
        <Button width={20} height={5}>
          Hello
        </Button>
      </HumanPlayerScopeProvider>,
    );

    await consumeConnectionsPlayersDumpRequest(packetInterceptor);

    await sendNewConnectionPacket(socket, { UCID: 1 });
    await sendNewPlayerPacket(socket, { UCID: 1, PLID: 5, PType: 0 });

    await packetInterceptor.waitForPacket(
      new IS_BTN({ ClickID: 0, ReqI: 1, UCID: 1, W: 20, H: 5, Text: 'Hello' }),
    );
    await packetInterceptor.assertNoMoreData();

    cleanup();
  });

  it('should not render a button for a connection with only an AI player', async () => {
    const { socket, packetInterceptor, cleanup } = await renderScoped(
      <HumanPlayerScopeProvider>
        <Button width={20} height={5}>
          Hello
        </Button>
      </HumanPlayerScopeProvider>,
    );

    await consumeConnectionsPlayersDumpRequest(packetInterceptor);

    await sendNewConnectionPacket(socket, { UCID: 1 });
    await sendNewPlayerPacket(socket, {
      UCID: 1,
      PLID: 5,
      PType: PlayerType.AI,
    });
    await wait(20);

    await packetInterceptor.assertNoMoreData();

    cleanup();
  });
});
