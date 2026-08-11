import { protocol } from 'electron';
import { APP_SCHEMA } from '../../../../common/constants/window.js';

export function registerSchemesAsPrivileged(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: APP_SCHEMA,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
      },
    },
  ]);
}
