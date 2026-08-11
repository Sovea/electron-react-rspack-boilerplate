import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from '@rspack/cli';
import { rspack } from '@rspack/core';
import { ReactRefreshRspackPlugin } from '@rspack/plugin-react-refresh';
import { rendererDevServerStateFile } from '../../src/common/dev-server.ts';
import {
  getCommonConfig,
  isDevelopment,
  projectRoot,
} from './rspack.common.config.ts';

const rendererDevServerStatePath = path.join(
  projectRoot,
  rendererDevServerStateFile,
);

export default defineConfig({
  ...getCommonConfig(),
  target: 'web',
  entry: {
    index: path.join(projectRoot, 'src/renderer/pages/index/index.tsx'),
  },
  output: {
    path: path.join(projectRoot, 'dist/renderer'),
    filename: 'assets/[name].[contenthash:8].js',
    publicPath: 'auto',
    clean: true,
  },
  module: {
    rules: [
      ...(getCommonConfig().module?.rules ?? []),
      {
        test: /\.css$/,
        type: 'css',
      },
    ],
  },
  plugins: [
    isDevelopment && new ReactRefreshRspackPlugin(),
    new rspack.HtmlRspackPlugin({
      template: path.join(projectRoot, 'index.html'),
      filename: 'index.html',
    }),
  ],
  optimization: {
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin(),
      new rspack.LightningCssMinimizerRspackPlugin(),
    ],
  },
  experiments: {
    css: true,
  },
  devServer: {
    host: 'localhost',
    port: 'auto',
    hot: true,
    historyApiFallback: true,
    client: {
      overlay: true,
    },
    onListening(devServer) {
      const address = devServer.server?.address();
      if (!address || typeof address === 'string') {
        throw new Error('Unable to resolve the renderer dev server address.');
      }

      mkdirSync(path.dirname(rendererDevServerStatePath), { recursive: true });
      writeFileSync(
        rendererDevServerStatePath,
        `http://localhost:${address.port}\n`,
      );
    },
  },
});
