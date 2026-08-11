import {
  access,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { templateRegistry } from '../template-registry.js';
import type {
  GenerateProjectOptions,
  GenerateProjectResult,
  GenerationStep,
} from '../types.js';
import {
  copyTemplate,
  removeTemplateMetadata,
  renameTemplateFiles,
  renderTemplateFile,
} from './copy-template.js';
import { mergePackageJson } from './merge-package-json.js';
import { getAppId, getProductName } from './project-metadata.js';

const templateRoot = fileURLToPath(
  new URL('../../templates/', import.meta.url),
);

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function validateTarget(targetDirectory: string): Promise<boolean> {
  if (!(await pathExists(targetDirectory))) {
    return false;
  }

  const entries = await readdir(targetDirectory);
  if (entries.length > 0) {
    throw new Error(`Target directory is not empty: ${targetDirectory}`);
  }

  return true;
}

function abortIfRequested(signal?: AbortSignal): void {
  signal?.throwIfAborted();
}

async function runStep(
  options: GenerateProjectOptions,
  step: GenerationStep,
  action: () => Promise<void>,
): Promise<void> {
  abortIfRequested(options.signal);
  options.onProgress?.({ type: 'step:start', step });

  try {
    await action();
    options.onProgress?.({ type: 'step:success', step });
  } catch (error) {
    const normalizedError =
      error instanceof Error ? error : new Error(String(error));
    options.onProgress?.({
      type: 'step:error',
      step,
      error: normalizedError,
    });
    throw normalizedError;
  }
}

export async function generateProject(
  options: GenerateProjectOptions,
): Promise<GenerateProjectResult> {
  const absoluteTargetDirectory = path.resolve(options.targetDirectory);
  const parentDirectory = path.dirname(absoluteTargetDirectory);
  const baseName = path.basename(absoluteTargetDirectory);
  let targetAlreadyExists = false;
  let stagingDirectory: string | undefined;

  try {
    await runStep(options, 'validate-target', async () => {
      targetAlreadyExists = await validateTarget(absoluteTargetDirectory);
      await mkdir(parentDirectory, { recursive: true });
      stagingDirectory = await mkdtemp(
        path.join(parentDirectory, `.${baseName}.create-electron-react-`),
      );
    });

    const staging = stagingDirectory;
    if (!staging) {
      throw new Error('Failed to create a staging directory.');
    }

    await runStep(options, 'copy-base', async () => {
      await copyTemplate(path.join(templateRoot, 'base'), staging);
    });

    await runStep(options, 'apply-bundler', async () => {
      const definition = templateRegistry[options.bundler];
      await copyTemplate(
        path.join(templateRoot, definition.directory),
        staging,
      );
    });

    await runStep(options, 'write-package-json', async () => {
      const basePackage = JSON.parse(
        await readFile(path.join(staging, 'package.base.json'), 'utf8'),
      ) as Record<string, unknown>;
      const overlayPackage = JSON.parse(
        await readFile(path.join(staging, 'package.patch.json'), 'utf8'),
      ) as Record<string, unknown>;
      const packageJson = mergePackageJson(
        basePackage,
        overlayPackage,
        options.projectName,
      );

      await writeFile(
        path.join(staging, 'package.json'),
        `${JSON.stringify(packageJson, null, 2)}\n`,
      );

      const replacements = {
        projectName: options.projectName,
        productName: getProductName(options.projectName),
        appId: getAppId(options.projectName),
        bundlerName: templateRegistry[options.bundler].displayName,
      };

      await Promise.all([
        renderTemplateFile(path.join(staging, 'README.md'), replacements),
        renderTemplateFile(
          path.join(staging, 'electron-builder.yml'),
          replacements,
        ),
      ]);
    });

    await runStep(options, 'finalize', async () => {
      await renameTemplateFiles(staging);
      await removeTemplateMetadata(staging);
      abortIfRequested(options.signal);

      if (targetAlreadyExists) {
        await copyTemplate(staging, absoluteTargetDirectory);
        await rm(staging, { recursive: true, force: true });
      } else {
        await rename(staging, absoluteTargetDirectory);
      }

      stagingDirectory = undefined;
    });

    return {
      targetDirectory: options.targetDirectory,
      absoluteTargetDirectory,
      projectName: options.projectName,
      bundler: options.bundler,
    };
  } finally {
    if (stagingDirectory) {
      await rm(stagingDirectory, { recursive: true, force: true });
    }
  }
}
