import { InSim } from 'node-insim';
import { IS_MST, PacketType } from 'node-insim/packets';
import React from 'react';
import ReactInSim from 'react-node-insim';

import { App } from './App';
import { ErrorBoundary } from './ErrorBoundary';

const inSim = new InSim();

const SEND_VERSION_REQUEST_ID = 200;

inSim.connect({
  ReqI: SEND_VERSION_REQUEST_ID,
  IName: 'React InSim',
  Host: '188.122.74.155',
  Port: 52317,
  Admin: 'test<password',
});

inSim.on('connect', () => console.log('Connected'));

inSim.on('disconnect', () => console.log('Disconnected'));

// TODO throw error if not yet connected while rendering
inSim.on(PacketType.ISP_VER, (packet) => {
  if (packet.ReqI !== SEND_VERSION_REQUEST_ID) {
    return;
  }

  inSim.send(
    new IS_MST({
      Msg: 'React Node InSim connected',
    }),
  );

  const root = ReactInSim.createRoot(inSim, { appendButtonIDs: false });

  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  );
});

process.on('uncaughtException', (error) => {
  console.log(error.message);
});
