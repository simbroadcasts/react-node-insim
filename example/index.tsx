import { InSimFlags } from 'node-insim/packets';
import React from 'react';
import { createRoot } from 'react-node-insim';

import { App } from './App';
import { ErrorBoundary } from './ErrorBoundary';

const root = createRoot({
  name: 'React InSim',
  host: '127.0.0.1',
  port: 29999,
  flags: InSimFlags.ISF_LOCAL,
});

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

// inSim.on('connect', () => console.log('Connected'));
//
// inSim.on('disconnect', () => console.log('Disconnected'));

process.on('uncaughtException', (error) => {
  console.log(error.message);
});
