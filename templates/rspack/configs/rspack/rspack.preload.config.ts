import path from 'node:path';
import { defineConfig } from '@rspack/cli';
import { getCommonConfig, projectRoot } from './rspack.common.config.ts';

export default defineConfig({
  ...getCommonConfig(),
  target: 'electron-preload',
  entry: {
    index: path.join(projectRoot, 'src/preload/index.ts'),
  },
  output: {
    path: path.join(projectRoot, 'dist/preload'),
    filename: '[name].js',
    clean: true,
    library: {
      type: 'commonjs2',
    },
  },
});
