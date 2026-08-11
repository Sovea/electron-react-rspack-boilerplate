import { Box, Text, useInput } from 'ink';
import { useState } from 'react';
import { templateRegistry } from '../template-registry.js';
import { type Bundler, bundlers } from '../types.js';

type BundlerSelectProps = {
  onSelect: (bundler: Bundler) => void;
  onCancel: () => void;
};

export function BundlerSelect({ onSelect, onCancel }: BundlerSelectProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    if (key.escape) {
      onCancel();
      return;
    }

    if (key.upArrow || key.downArrow) {
      setSelectedIndex((current) => (current === 0 ? 1 : 0));
      return;
    }

    if (key.return) {
      const selected = bundlers[selectedIndex];
      if (selected) {
        onSelect(selected);
      }
      return;
    }

    const shortcutIndex = bundlers.findIndex(
      (bundler) => bundler[0] === input.toLowerCase(),
    );
    if (shortcutIndex >= 0) {
      setSelectedIndex(shortcutIndex);
    }
  });

  return (
    <Box flexDirection="column">
      <Text bold>Select a bundler</Text>
      {bundlers.map((bundler, index) => (
        <Text
          key={bundler}
          color={index === selectedIndex ? 'cyan' : undefined}
        >
          {index === selectedIndex ? '❯' : ' '}{' '}
          {templateRegistry[bundler].displayName}
        </Text>
      ))}
      <Text dimColor>↑/↓ to move · Enter to select · Esc to cancel</Text>
    </Box>
  );
}
