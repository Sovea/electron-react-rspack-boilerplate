export const bundlers = ['vite', 'rspack'] as const;

export type Bundler = (typeof bundlers)[number];

export type ScaffoldInput = {
  directory?: string;
  bundler?: Bundler;
};

export type ScaffoldOptions = {
  targetDirectory: string;
  projectName: string;
  bundler: Bundler;
};

export type GenerationStep =
  | 'validate-target'
  | 'copy-base'
  | 'apply-bundler'
  | 'write-package-json'
  | 'finalize';

export type GenerationEvent = {
  type: 'step:start' | 'step:success' | 'step:error';
  step: GenerationStep;
  error?: Error;
};

export type GenerateProjectOptions = ScaffoldOptions & {
  signal?: AbortSignal;
  onProgress?: (event: GenerationEvent) => void;
};

export type GenerateProjectResult = ScaffoldOptions & {
  absoluteTargetDirectory: string;
};
