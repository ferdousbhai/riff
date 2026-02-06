import React from "react";
import { Box, Text } from "ink";

interface PatternDisplayProps {
  pattern: string | null;
}

export function PatternDisplay({ pattern }: PatternDisplayProps) {
  if (!pattern) return null;

  return (
    <Box flexDirection="column">
      <Text dimColor>{"─".repeat(50)}</Text>
      <Box paddingLeft={1}>
        <Text color="yellow">{pattern}</Text>
      </Box>
    </Box>
  );
}
