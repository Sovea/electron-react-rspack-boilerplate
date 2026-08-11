import assert from 'node:assert/strict';
import test from 'node:test';
import { render } from 'ink-testing-library';
import React from 'react';
import { BundlerSelect } from '../src/components/bundler-select.js';
import type { Bundler } from '../src/types.js';

test('selects a bundler with keyboard input', async () => {
  let selected: Bundler | undefined;
  const view = render(
    React.createElement(BundlerSelect, {
      onSelect: (bundler) => {
        selected = bundler;
      },
      onCancel: () => {},
    }),
  );

  view.stdin.write('r');
  await new Promise((resolve) => setImmediate(resolve));
  assert.match(view.lastFrame() ?? '', /❯ Rspack/);

  view.stdin.write('\r');
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(selected, 'rspack');
});
