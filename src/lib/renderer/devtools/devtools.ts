import './devtools-window-polyfill.js';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import * as devtools from 'react-devtools-core';

devtools.initialize();
devtools.connectToDevTools();
