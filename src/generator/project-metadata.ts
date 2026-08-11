import path from 'node:path';

const packageNamePattern =
  /^(?:@[a-z0-9][a-z0-9._~-]*\/[a-z0-9][a-z0-9._~-]*|[a-z0-9][a-z0-9._~-]*)$/;

export function getProjectName(targetDirectory: string): string {
  const resolved = path.resolve(targetDirectory);
  const projectName = path.basename(resolved);

  if (!packageNamePattern.test(projectName)) {
    throw new Error(
      `"${projectName}" is not a valid package name. Use lowercase letters, numbers, dots, dashes, or underscores.`,
    );
  }

  return projectName;
}

export function getProductName(projectName: string): string {
  return projectName
    .split(/[-_.]+/)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join(' ');
}

export function getAppId(projectName: string): string {
  const identifier = projectName.replace(/[^a-z0-9]/g, '') || 'app';
  return `com.example.${identifier}`;
}
