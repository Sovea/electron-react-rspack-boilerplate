import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { runCommand } from '../src/command.js';

test('runs silently when directory and bundler are provided', async () => {
  const temporaryRoot = await mkdtemp(
    path.join(os.tmpdir(), 'create-electron-react-command-'),
  );
  const targetDirectory = path.join(temporaryRoot, 'my-app');
  let output = '';

  try {
    await runCommand(
      {
        directory: targetDirectory,
        bundler: 'vite',
      },
      {
        interactive: false,
        stdout: {
          write: ((chunk: string) => {
            output += chunk;
            return true;
          }) as NodeJS.WriteStream['write'],
        },
      },
    );

    assert.match(output, /Created my-app with Vite/);
    assert.match(output, /pnpm install/);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test('requires complete input outside a TTY', async () => {
  await assert.rejects(
    runCommand(
      { directory: 'my-app' },
      {
        interactive: false,
        stdout: process.stdout,
      },
    ),
    /required in a non-interactive terminal/,
  );
});
