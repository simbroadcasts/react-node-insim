import ws from 'ws';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const customGlobal = global as any;

// These things must exist before importing `react-devtools-core`
customGlobal.WebSocket ||= ws;
customGlobal.window ||= global;
customGlobal.self ||= global;
