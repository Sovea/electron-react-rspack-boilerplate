import path from 'node:path';
import type { Configuration } from '@rspack/core';

export const projectRoot = path.resolve(import.meta.dirname, '../..');
export const isDevelopment = process.env.NODE_ENV === 'development';

export function getCommonConfig(): Configuration {
  return {
    mode: isDevelopment ? 'development' : 'production',
    devtool: isDevelopment ? 'cheap-module-source-map' : false,
    cache: true,
    node: {
      __dirname: false,
      __filename: false,
    },
    resolve: {
      extensions: ['.js', '.mjs', '.ts', '.tsx', '.jsx'],
      extensionAlias: {
        '.js': ['.ts', '.tsx', '.js'],
      },
      alias: {
        '@': path.join(projectRoot, 'src'),
      },
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'builtin:swc-loader',
              options: {
                jsc: {
                  parser: {
                    syntax: 'typescript',
                    tsx: true,
                  },
                  transform: {
                    react: {
                      runtime: 'automatic',
                      development: isDevelopment,
                      refresh: isDevelopment,
                    },
                  },
                },
              },
            },
          ],
        },
      ],
    },
  };
}
