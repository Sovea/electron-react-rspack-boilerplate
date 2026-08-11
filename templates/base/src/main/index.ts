import { app, BrowserWindow } from 'electron';
import { handleAppSchema } from './modules/protocol/privilege/app.js';
import { registerSchemesAsPrivileged } from './modules/protocol/privilege/index.js';
import { createMainWindow } from './windows/index/index.js';

registerSchemesAsPrivileged();

app.whenReady().then(() => {
  handleAppSchema();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
