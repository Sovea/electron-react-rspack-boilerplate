import { Box, Text, useInput } from 'ink';

type ProjectNameInputProps = {
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export function ProjectNameInput({
  value,
  error,
  onChange,
  onSubmit,
  onCancel,
}: ProjectNameInputProps) {
  useInput((input, key) => {
    if (key.escape) {
      onCancel();
      return;
    }

    if (key.return) {
      onSubmit();
      return;
    }

    if (key.backspace || key.delete) {
      onChange(value.slice(0, -1));
      return;
    }

    if (!key.ctrl && !key.meta && input) {
      const printableInput = [...input]
        .filter((character) => {
          const codePoint = character.codePointAt(0) ?? 0;
          return codePoint >= 32 && codePoint !== 127;
        })
        .join('');
      onChange(`${value}${printableInput}`);
    }
  });

  return (
    <Box flexDirection="column">
      <Text bold>Project directory</Text>
      <Text>
        <Text color="cyan">› </Text>
        {value}
        <Text inverse> </Text>
      </Text>
      {error ? <Text color="red">{error}</Text> : null}
      <Text dimColor>Enter to continue · Esc to cancel</Text>
    </Box>
  );
}
