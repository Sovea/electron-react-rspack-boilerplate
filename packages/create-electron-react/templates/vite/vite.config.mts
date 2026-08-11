import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron/simple';

const projectRoot = import.meta.dirname;
let electronStarted = false;

export default defineConfig({
  base: './',
  plugins: [
    react(),
    electron({
      main: {
        entry: path.join(projectRoot, 'src/main/index.ts'),
        async onstart({ startup }) {
          electronStarted = await startup(undefined, { cwd: projectRoot });
        },
        vite: {
          build: {
            outDir: path.join(projectRoot, 'dist/main'),
            emptyOutDir: true,
            rolldownOptions: {
              output: {
                entryFileNames: 'index.js',
              },
            },
          },
        },
      },
      preload: {
        input: {
          index: path.join(projectRoot, 'src/preload/index.ts'),
        },
        async onstart({ reload, startup }) {
          if (electronStarted) {
            reload();
            return;
          }

          electronStarted = await startup(undefined, { cwd: projectRoot });
        },
        vite: {
          build: {
            outDir: path.join(projectRoot, 'dist/preload'),
            emptyOutDir: true,
            rolldownOptions: {
              output: {
                entryFileNames: '[name].js',
              },
            },
          },
        },
      },
    }),
  ],
  build: {
    outDir: path.join(projectRoot, 'dist/renderer'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.join(projectRoot, 'src'),
    },
  },
});
