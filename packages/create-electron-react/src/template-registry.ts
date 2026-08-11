import type { Bundler } from './types.js';

export type TemplateDefinition = {
  displayName: string;
  directory: Bundler;
};

export const templateRegistry = {
  vite: {
    displayName: 'Vite',
    directory: 'vite',
  },
  rspack: {
    displayName: 'Rspack',
    directory: 'rspack',
  },
} as const satisfies Record<Bundler, TemplateDefinition>;
