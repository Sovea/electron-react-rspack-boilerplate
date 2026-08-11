import { cp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function copyTemplate(
  sourceDirectory: string,
  targetDirectory: string,
): Promise<void> {
  await cp(sourceDirectory, targetDirectory, {
    recursive: true,
    force: true,
  });
}

export async function renameTemplateFiles(
  targetDirectory: string,
): Promise<void> {
  const files = [
    ['_gitignore', '.gitignore'],
    ['_biome.json', 'biome.json'],
  ] as const;

  for (const [sourceName, destinationName] of files) {
    const source = path.join(targetDirectory, sourceName);
    const destination = path.join(targetDirectory, destinationName);

    try {
      await rename(source, destination);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}

export async function renderTemplateFile(
  filePath: string,
  replacements: Record<string, string>,
): Promise<void> {
  let contents = await readFile(filePath, 'utf8');

  for (const [token, value] of Object.entries(replacements)) {
    contents = contents.replaceAll(`{{${token}}}`, value);
  }

  await writeFile(filePath, contents);
}

export async function removeTemplateMetadata(
  targetDirectory: string,
): Promise<void> {
  await Promise.all([
    rm(path.join(targetDirectory, 'package.base.json'), { force: true }),
    rm(path.join(targetDirectory, 'package.patch.json'), { force: true }),
  ]);
}
