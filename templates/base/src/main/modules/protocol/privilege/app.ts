import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { app, net, protocol } from 'electron';
import {
  APP_SCHEMA,
  APP_SCHEMA_HOST,
  type AppSchemaHost,
} from '../../../../common/constants/window.js';

export function handleAppSchema(): void {
  protocol.handle(APP_SCHEMA, (request) => {
    const url = new URL(request.url);
    if ((url.host as AppSchemaHost) !== APP_SCHEMA_HOST.PAGE) {
      return new Response('Not found', { status: 404 });
    }

    const rendererRoot = path.resolve(app.getAppPath(), 'dist/renderer');
    const relativePath = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    const filePath = path.resolve(rendererRoot, relativePath || 'index.html');
    const isInsideRendererRoot =
      filePath === rendererRoot ||
      filePath.startsWith(`${rendererRoot}${path.sep}`);

    if (!isInsideRendererRoot) {
      return new Response('Forbidden', { status: 403 });
    }

    return net.fetch(pathToFileURL(filePath).toString());
  });
}
