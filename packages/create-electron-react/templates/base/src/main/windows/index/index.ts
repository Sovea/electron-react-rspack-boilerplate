import path from 'node:path';
import { BrowserWindow } from 'electron';
import { getAppPageUrl } from '../../../common/utils/window.js';
import { getRendererDevUrl } from '../../runtime/dev-server.js';

export function createMainWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 960,
    height: 640,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, '../preload/index.js'),
    },
  });

  window.once('ready-to-show', () => window.show());

  const rendererDevUrl = getRendererDevUrl();
  void window.loadURL(rendererDevUrl ?? getAppPageUrl('index.html'));

  return window;
}
