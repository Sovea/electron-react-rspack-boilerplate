import { readFileSync } from 'node:fs';
import path from 'node:path';
import { app } from 'electron';
import { rendererDevServerStateFile } from '../../common/dev-server.js';

declare const __DEV__: boolean;

export function getRendererDevUrl(): string | undefined {
  if (!__DEV__) {
    return undefined;
  }

  try {
    return readFileSync(
      path.join(app.getAppPath(), rendererDevServerStateFile),
      'utf8',
    ).trim();
  } catch (error) {
    throw new Error(
      'Renderer dev server is not available. Run "pnpm dev" before "pnpm start".',
      { cause: error },
    );
  }
}
