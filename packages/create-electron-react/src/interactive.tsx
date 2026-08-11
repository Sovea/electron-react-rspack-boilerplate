import { render } from 'ink';
import { Application } from './application.js';
import { GenerationProgress } from './components/generation-progress.js';
import { Result } from './components/result.js';
import { generateProject } from './generator/generate-project.js';
import type {
  GenerateProjectResult,
  GenerationEvent,
  ScaffoldInput,
  ScaffoldOptions,
} from './types.js';

async function collectOptions(input: ScaffoldInput): Promise<ScaffoldOptions> {
  let resolveOptions: (options: ScaffoldOptions) => void;
  let rejectOptions: (error: Error) => void;
  const result = new Promise<ScaffoldOptions>((resolve, reject) => {
    resolveOptions = resolve;
    rejectOptions = reject;
  });

  const instance = render(
    <Application
      initialInput={input}
      onSubmit={(options) => resolveOptions(options)}
      onCancel={() => rejectOptions(new Error('Operation cancelled.'))}
    />,
  );

  try {
    const options = await result;
    await instance.waitUntilExit();
    return options;
  } catch (error) {
    instance.unmount();
    throw error;
  }
}

export async function runInteractive(
  input: ScaffoldInput,
  signal?: AbortSignal,
): Promise<GenerateProjectResult> {
  const options = await collectOptions(input);
  let events: GenerationEvent[] = [];
  const progress = render(<GenerationProgress events={events} />);

  try {
    const result = await generateProject({
      ...options,
      signal,
      onProgress: (event) => {
        events = [...events, event];
        progress.rerender(<GenerationProgress events={events} />);
      },
    });
    progress.unmount();
    const resultView = render(<Result result={result} />);
    resultView.unmount();
    return result;
  } catch (error) {
    progress.unmount();
    throw error;
  }
}
