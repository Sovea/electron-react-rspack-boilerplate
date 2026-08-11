#!/usr/bin/env node

import { createCommand } from './command.js';

const abortController = new AbortController();

process.once('SIGINT', () => {
  abortController.abort(new Error('Operation cancelled.'));
});

try {
  const command = createCommand({
    interactive: Boolean(process.stdin.isTTY && process.stdout.isTTY),
    stdout: process.stdout,
    signal: abortController.signal,
  });
  await command.parseAsync(process.argv);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Error: ${message}\n`);
  process.exitCode = abortController.signal.aborted ? 130 : 1;
}
