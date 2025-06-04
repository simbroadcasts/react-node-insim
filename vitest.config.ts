import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      'react-node-insim': path.resolve(__dirname, './src/index'),
    },
  },
  test: {
    coverage: {
      reporter: ['json-summary'],
    },
  },
});
