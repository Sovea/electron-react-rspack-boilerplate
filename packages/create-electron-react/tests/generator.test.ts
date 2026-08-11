import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { generateProject } from '../src/generator/generate-project.js';

for (const bundler of ['vite', 'rspack'] as const) {
  test(`generates a standalone ${bundler} project`, async () => {
    const temporaryRoot = await mkdtemp(
      path.join(os.tmpdir(), 'create-electron-react-'),
    );
    const targetDirectory = path.join(temporaryRoot, `${bundler}-app`);

    try {
      await generateProject({
        targetDirectory,
        projectName: `${bundler}-app`,
        bundler,
      });

      const packageJson = JSON.parse(
        await readFile(path.join(targetDirectory, 'package.json'), 'utf8'),
      ) as {
        name: string;
        scripts: Record<string, string>;
        devDependencies: Record<string, string>;
      };
      const builderConfig = await readFile(
        path.join(targetDirectory, 'electron-builder.yml'),
        'utf8',
      );

      assert.equal(packageJson.name, `${bundler}-app`);
      assert.ok(packageJson.scripts.dev);
      assert.ok(packageJson.scripts.build);
      assert.ok(packageJson.devDependencies.react);
      assert.ok(packageJson.devDependencies.typescript);
      assert.match(builderConfig, /appId: com\.example\.(vite|rspack)app/);
      await readFile(path.join(targetDirectory, 'index.html'), 'utf8');
      await readFile(
        path.join(targetDirectory, 'src/renderer/pages/index/index.tsx'),
        'utf8',
      );
      await readFile(
        path.join(targetDirectory, 'src/renderer/pages/index/index.css'),
        'utf8',
      );
      await readFile(
        path.join(targetDirectory, 'src/common/constants/window.ts'),
        'utf8',
      );
      await readFile(
        path.join(targetDirectory, 'src/common/utils/window.ts'),
        'utf8',
      );
      await readFile(
        path.join(
          targetDirectory,
          'src/main/modules/protocol/privilege/app.ts',
        ),
        'utf8',
      );
      await readFile(
        path.join(targetDirectory, 'src/main/windows/index/index.ts'),
        'utf8',
      );
      await readFile(path.join(targetDirectory, 'src/types/window.ts'), 'utf8');
      await assert.rejects(
        readFile(path.join(targetDirectory, 'src/renderer/index.html'), 'utf8'),
      );
      await assert.rejects(
        readFile(
          path.join(targetDirectory, 'src/renderer/src/index.html'),
          'utf8',
        ),
      );
      await assert.rejects(
        readFile(path.join(targetDirectory, 'src/main/protocol.ts'), 'utf8'),
      );
      await assert.rejects(
        readFile(path.join(targetDirectory, 'src/main/window.ts'), 'utf8'),
      );
      await assert.rejects(
        readFile(
          path.join(targetDirectory, 'src/renderer/src/main.tsx'),
          'utf8',
        ),
      );

      if (bundler === 'vite') {
        assert.ok(packageJson.devDependencies.vite);
        assert.equal(packageJson.devDependencies['@rspack/core'], undefined);
        const viteConfig = await readFile(
          path.join(targetDirectory, 'vite.config.mts'),
          'utf8',
        );
        assert.doesNotMatch(viteConfig, /port:\s*5173/);
        assert.doesNotMatch(viteConfig, /strictPort/);
        assert.match(
          viteConfig,
          /startup\(undefined,\s*\{ cwd: projectRoot \}\)/,
        );
        assert.doesNotMatch(
          viteConfig,
          /root:\s*path\.join\(projectRoot,\s*'src\/renderer'\)/,
        );
      } else {
        assert.ok(packageJson.devDependencies['@rspack/core']);
        assert.equal(packageJson.devDependencies.vite, undefined);
        assert.ok(packageJson.devDependencies.concurrently);
        assert.equal(packageJson.devDependencies.tsx, undefined);
        assert.equal(packageJson.devDependencies.nodemon, undefined);
        assert.equal(packageJson.devDependencies['wait-on'], undefined);
        assert.ok(packageJson.scripts['dev:main']);
        assert.ok(packageJson.scripts['dev:preload']);
        assert.ok(packageJson.scripts['dev:renderer']);
        assert.equal(packageJson.scripts['dev:electron'], undefined);
        assert.equal(packageJson.scripts.start, 'electron .');
        assert.ok(packageJson.scripts['build:main']);
        assert.ok(packageJson.scripts['build:preload']);
        assert.ok(packageJson.scripts['build:renderer']);
        const rendererConfig = await readFile(
          path.join(
            targetDirectory,
            'configs/rspack/rspack.renderer.config.ts',
          ),
          'utf8',
        );
        assert.match(rendererConfig, /port: 'auto'/);
        assert.doesNotMatch(rendererConfig, /5173/);
        assert.match(rendererConfig, /src\/renderer\/pages\/index\/index\.tsx/);
        await readFile(
          path.join(targetDirectory, 'src/common/dev-server.ts'),
          'utf8',
        );
        await assert.rejects(
          readFile(
            path.join(targetDirectory, 'scripts/build-rspack.ts'),
            'utf8',
          ),
        );
        await assert.rejects(
          readFile(path.join(targetDirectory, 'scripts/dev-rspack.ts'), 'utf8'),
        );
      }

      await assert.rejects(
        readFile(path.join(targetDirectory, 'package.base.json'), 'utf8'),
      );
      await readFile(path.join(targetDirectory, '.gitignore'), 'utf8');
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  });
}

test('rejects a non-empty target directory', async () => {
  const temporaryRoot = await mkdtemp(
    path.join(os.tmpdir(), 'create-electron-react-'),
  );

  try {
    await writeFile(path.join(temporaryRoot, 'existing.txt'), 'existing');
    await assert.rejects(
      generateProject({
        targetDirectory: temporaryRoot,
        projectName: 'existing-app',
        bundler: 'vite',
      }),
      /not empty/,
    );
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
