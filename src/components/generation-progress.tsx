import { Box, Text } from 'ink';
import type { GenerationEvent, GenerationStep } from '../types.js';

const labels: Record<GenerationStep, string> = {
  'validate-target': 'Validate target directory',
  'copy-base': 'Copy base template',
  'apply-bundler': 'Apply bundler configuration',
  'write-package-json': 'Generate project metadata',
  finalize: 'Finalize project',
};

type GenerationProgressProps = {
  events: GenerationEvent[];
};

export function GenerationProgress({ events }: GenerationProgressProps) {
  const latestEvents = new Map<GenerationStep, GenerationEvent>();
  for (const event of events) {
    latestEvents.set(event.step, event);
  }

  return (
    <Box flexDirection="column">
      <Text bold>Creating project</Text>
      {Array.from(latestEvents.values()).map((event) => {
        const marker =
          event.type === 'step:success'
            ? '✓'
            : event.type === 'step:error'
              ? '×'
              : '◐';
        const color =
          event.type === 'step:success'
            ? 'green'
            : event.type === 'step:error'
              ? 'red'
              : 'cyan';

        return (
          <Text key={event.step} color={color}>
            {marker} {labels[event.step]}
          </Text>
        );
      })}
    </Box>
  );
}
