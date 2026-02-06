import React from "react";
import { Box, Text, Static } from "ink";
import type { Message } from "../lib/types.js";

interface ChatAreaProps {
  messages: Message[];
  streamingText: string;
}

export function ChatArea({ messages, streamingText }: ChatAreaProps) {
  // Completed messages rendered via Static (won't re-render)
  const completed = streamingText
    ? messages.slice(0, -1)
    : messages;

  // The currently streaming message (last assistant message)
  const streaming =
    streamingText && messages.length > 0
      ? messages[messages.length - 1]
      : null;

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Static items={completed}>
        {(msg) => (
          <Box key={msg.id} paddingLeft={1}>
            <Text>
              <Text bold color={msg.role === "user" ? "green" : "magenta"}>
                {msg.role === "user" ? "You" : "Claude"}:
              </Text>{" "}
              <Text>{msg.content}</Text>
            </Text>
          </Box>
        )}
      </Static>

      {streaming && (
        <Box paddingLeft={1}>
          <Text>
            <Text bold color="magenta">
              Claude:
            </Text>{" "}
            <Text>{streaming.content}</Text>
            <Text dimColor>{"▌"}</Text>
          </Text>
        </Box>
      )}
    </Box>
  );
}
