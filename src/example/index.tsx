import { InSim } from 'node-insim';
import { InSimFlags, PacketType } from 'node-insim/packets';
import { ReactInSim } from 'node-insim-react';
import React from 'react';

import { App } from './App';
import { ErrorBoundary } from './ErrorBoundary';

const inSim = new InSim();

const sendVersionReqI = 200;

inSim.connect({
  ReqI: sendVersionReqI,
  IName: 'React InSim',
  Host: '127.0.0.1',
  Port: 29999,
  Flags: InSimFlags.ISF_LOCAL,
});

inSim.on('connect', () => console.log('Connected'));

inSim.on('disconnect', () => console.log('Disconnected'));

// TODO throw error if not yet connected while rendering
inSim.on(PacketType.ISP_VER, (packet) => {
  if (packet.ReqI !== sendVersionReqI) {
    return;
  }

  const root = ReactInSim.createRoot(inSim);

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
