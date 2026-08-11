import { createRequire } from 'node:module';
import { Command, InvalidArgumentError } from 'commander';
import { generateProject } from './generator/generate-project.js';
import { getProjectName } from './generator/project-metadata.js';
import { runInteractive } from './interactive.js';
import { templateRegistry } from './template-registry.js';
import { type Bundler, bundlers, type ScaffoldInput } from './types.js';

const require = createRequire(import.meta.url);
const { version: packageVersion } = require('../package.json') as {
  version: string;
};

type RunCommandContext = {
  interactive: boolean;
  stdout: Pick<NodeJS.WriteStream, 'write'>;
  signal?: AbortSignal;
};

function parseBundler(value: string): Bundler {
  if (bundlers.includes(value as Bundler)) {
    return value as Bundler;
  }

  throw new InvalidArgumentError('Expected "vite" or "rspack".');
}

export async function runCommand(
  input: ScaffoldInput,
  context: RunCommandContext,
): Promise<void> {
  if (!input.directory || !input.bundler) {
    if (!context.interactive) {
      throw new Error(
        'A project directory and --bundler <vite|rspack> are required in a non-interactive terminal.',
      );
    }

    await runInteractive(input, context.signal);
    return;
  }

  const projectName = getProjectName(input.directory);
  const result = await generateProject({
    targetDirectory: input.directory,
    projectName,
    bundler: input.bundler,
    signal: context.signal,
  });

  context.stdout.write(
    `Created ${result.projectName} with ${templateRegistry[result.bundler].displayName}.\n\n` +
      `Next steps:\n` +
      `  cd ${result.targetDirectory}\n` +
      `  pnpm install\n` +
      `  pnpm dev\n`,
  );
}

export function createCommand(context: RunCommandContext): Command {
  return new Command()
    .name('create-electron-react')
    .description(
      'Create an Electron application with React, TypeScript, and Vite or Rspack.',
    )
    .version(packageVersion)
    .argument('[directory]', 'target directory')
    .option('-b, --bundler <bundler>', 'vite or rspack', parseBundler)
    .action(
      async (directory: string | undefined, flags: { bundler?: Bundler }) => {
        await runCommand(
          {
            directory,
            bundler: flags.bundler,
          },
          context,
        );
      },
    );
}
