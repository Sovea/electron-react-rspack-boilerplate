import path from 'node:path';
import { defineConfig } from '@rspack/cli';
import { rspack } from '@rspack/core';
import {
  getCommonConfig,
  isDevelopment,
  projectRoot,
} from './rspack.common.config.ts';

export default defineConfig({
  ...getCommonConfig(),
  target: 'electron-main',
  entry: {
    index: path.join(projectRoot, 'src/main/index.ts'),
  },
  plugins: [
    new rspack.DefinePlugin({
      __DEV__: JSON.stringify(isDevelopment),
    }),
  ],
  output: {
    path: path.join(projectRoot, 'dist/main'),
    filename: '[name].js',
    clean: true,
    library: {
      type: 'commonjs2',
    },
  },
});
