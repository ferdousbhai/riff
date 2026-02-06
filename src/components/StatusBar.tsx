import React from "react";
import { Box, Text } from "ink";
import type { PlaybackState } from "../lib/types.js";

interface StatusBarProps {
  playbackState: PlaybackState;
  error: string | null;
}

const STATE_DISPLAY: Record<PlaybackState, { label: string; color: string }> = {
  stopped: { label: "Stopped", color: "gray" },
  playing: { label: "Playing", color: "green" },
  loading: { label: "Loading...", color: "yellow" },
  error: { label: "Error", color: "red" },
};

export function StatusBar({ playbackState, error }: StatusBarProps) {
  const { label, color } = STATE_DISPLAY[playbackState];

  return (
    <Box flexDirection="column">
      <Text dimColor>{"─".repeat(50)}</Text>
      <Box paddingLeft={1} gap={2}>
        <Text>
          <Text color={color} bold>
            {playbackState === "playing" ? "▶" : "■"} {label}
          </Text>
        </Text>
        <Text dimColor>ctrl+. stop</Text>
        <Text dimColor>ctrl+c quit</Text>
      </Box>
      {error && (
        <Box paddingLeft={1}>
          <Text color="red">{error}</Text>
        </Box>
      )}
    </Box>
  );
}
