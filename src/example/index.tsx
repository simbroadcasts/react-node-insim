import { InSim } from 'node-insim';
import { InSimFlags, IS_ISI_ReqI, PacketType } from 'node-insim/packets';
import React from 'react';

import { InSimRenderer } from '../lib';
import { App } from './App';
import { ErrorBoundary } from './ErrorBoundary';

const inSim = new InSim();

inSim.connect({
  ReqI: IS_ISI_ReqI.SEND_VERSION,
  IName: 'React InSim',
  Host: '127.0.0.1',
  Port: 29999,
  Flags: InSimFlags.ISF_LOCAL,
});

inSim.on('connect', () => console.log('Connected'));

inSim.on('disconnect', () => console.log('Disconnected'));

inSim.on(PacketType.ISP_VER, () => {
  InSimRenderer.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
    inSim,
  );
});

process.on('uncaughtException', (error) => {
  console.log(error.message);
});
