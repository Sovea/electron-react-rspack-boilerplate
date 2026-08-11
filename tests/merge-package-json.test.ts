import assert from 'node:assert/strict';
import test from 'node:test';
import { mergePackageJson } from '../src/generator/merge-package-json.js';

test('merges only supported package object fields', () => {
  const result = mergePackageJson(
    {
      name: 'base',
      private: true,
      scripts: { check: 'base-check' },
      devDependencies: { react: '^19.0.0' },
    },
    {
      description: 'Vite application',
      scripts: { dev: 'vite' },
      devDependencies: { vite: '^8.0.0' },
    },
    'my-app',
  );

  assert.deepEqual(result, {
    name: 'my-app',
    private: true,
    description: 'Vite application',
    scripts: {
      check: 'base-check',
      dev: 'vite',
    },
    devDependencies: {
      react: '^19.0.0',
      vite: '^8.0.0',
    },
  });
});
