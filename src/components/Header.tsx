import React from "react";
import { Box, Text } from "ink";

export function Header() {
  return (
    <Box flexDirection="column">
      <Text bold color="cyan">
        {" "}Riff
      </Text>
      <Text dimColor>{"─".repeat(50)}</Text>
    </Box>
  );
}
