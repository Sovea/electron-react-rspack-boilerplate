import { Box, Text } from 'ink';
import { templateRegistry } from '../template-registry.js';
import type { GenerateProjectResult } from '../types.js';

type ResultProps = {
  result: GenerateProjectResult;
};

export function Result({ result }: ResultProps) {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text color="green" bold>
        Created {result.projectName} with{' '}
        {templateRegistry[result.bundler].displayName}.
      </Text>
      <Text> </Text>
      <Text bold>Next steps:</Text>
      <Text> cd {result.targetDirectory}</Text>
      <Text> pnpm install</Text>
      <Text> pnpm dev</Text>
    </Box>
  );
}
