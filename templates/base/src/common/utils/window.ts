import {
  APP_SCHEMA,
  APP_SCHEMA_HOST,
  type AppSchemaHost,
} from '../constants/window.js';

export function getAppSchemaUrl(host: AppSchemaHost, pathname: string): string {
  return `${APP_SCHEMA}://${host}/${pathname}`;
}

export function getAppPageUrl(pathname: string): string {
  return getAppSchemaUrl(APP_SCHEMA_HOST.PAGE, pathname);
}
