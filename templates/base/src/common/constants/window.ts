export const APP_SCHEMA = 'app';

export const APP_SCHEMA_HOST = {
  PAGE: 'page',
} as const satisfies Record<string, string>;

export type AppSchemaHost =
  (typeof APP_SCHEMA_HOST)[keyof typeof APP_SCHEMA_HOST];
