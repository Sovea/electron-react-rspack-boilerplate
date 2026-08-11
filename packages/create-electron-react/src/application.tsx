import { Box, Text, useApp } from 'ink';
import { useState } from 'react';
import { BundlerSelect } from './components/bundler-select.js';
import { ProjectNameInput } from './components/project-name-input.js';
import { getProjectName } from './generator/project-metadata.js';
import type { Bundler, ScaffoldInput, ScaffoldOptions } from './types.js';

type ApplicationProps = {
  initialInput: ScaffoldInput;
  onSubmit: (options: ScaffoldOptions) => void;
  onCancel: () => void;
};

export function Application({
  initialInput,
  onSubmit,
  onCancel,
}: ApplicationProps) {
  const { exit } = useApp();
  const [directory, setDirectory] = useState(
    initialInput.directory ?? 'my-app',
  );
  const bundler: Bundler | undefined = initialInput.bundler;
  const [stage, setStage] = useState<'directory' | 'bundler'>(
    initialInput.directory ? 'bundler' : 'directory',
  );
  const [error, setError] = useState<string>();

  const cancel = () => {
    onCancel();
    exit();
  };

  const submit = (selectedBundler: Bundler) => {
    try {
      const projectName = getProjectName(directory);
      onSubmit({
        targetDirectory: directory,
        projectName,
        bundler: selectedBundler,
      });
      exit();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : String(submitError),
      );
      setStage('directory');
    }
  };

  const submitDirectory = () => {
    try {
      getProjectName(directory);
      setError(undefined);

      if (bundler) {
        submit(bundler);
      } else {
        setStage('bundler');
      }
    } catch (directoryError) {
      setError(
        directoryError instanceof Error
          ? directoryError.message
          : String(directoryError),
      );
    }
  };

  return (
    <Box flexDirection="column">
      <Text color="cyan" bold>
        Electron React Starter
      </Text>
      <Text>React · TypeScript</Text>
      <Text> </Text>
      {stage === 'directory' ? (
        <ProjectNameInput
          value={directory}
          error={error}
          onChange={(value) => {
            setDirectory(value);
            setError(undefined);
          }}
          onSubmit={submitDirectory}
          onCancel={cancel}
        />
      ) : (
        <BundlerSelect onSelect={submit} onCancel={cancel} />
      )}
    </Box>
  );
}
