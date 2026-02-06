import React, { useState, useCallback, useEffect } from "react";
import { Box, Text, useApp, useInput } from "ink";
import TextInput from "ink-text-input";
import { Header } from "./components/Header.js";
import { ChatArea } from "./components/ChatArea.js";
import { PatternDisplay } from "./components/PatternDisplay.js";
import { StatusBar } from "./components/StatusBar.js";
import { useChat, buildRetryMessage } from "./hooks/useChat.js";
import { usePlayback } from "./hooks/usePlayback.js";

const MAX_RETRIES = 2;

export function App() {
  const { exit } = useApp();
  const [inputValue, setInputValue] = useState("");
  const { messages, streamingText, isStreaming, sendMessage, abortStream } = useChat();
  const {
    playbackState,
    currentPattern,
    error,
    initBrowser,
    play,
    stop,
    shutdown,
  } = usePlayback();
  const [browserStatus, setBrowserStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");

  // Launch browser on mount
  useEffect(() => {
    initBrowser()
      .then(() => setBrowserStatus("ready"))
      .catch(() => setBrowserStatus("error"));
  }, [initBrowser]);

  useInput((input, key) => {
    // Ctrl+. — stop playback (Strudel convention)
    if (input === "." && key.ctrl) {
      stop();
    }
    // Escape — cancel streaming response
    if (key.escape && isStreaming) {
      abortStream();
    }
  });

  const handleSubmit = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      setInputValue("");

      // sendMessage internally guards against double-submission via busyRef
      const pattern = await sendMessage(text.trim());

      // Auto-play if a pattern was extracted
      if (pattern) {
        const result = await play(pattern);

        // Auto-retry loop: if evaluation fails, ask Claude to fix
        if (!result.ok && result.error) {
          let retries = 0;
          let lastError = result.error;
          let lastCode = pattern;

          while (retries < MAX_RETRIES) {
            retries++;
            const retryMsg = buildRetryMessage(lastCode, lastError);
            const fixedPattern = await sendMessage(retryMsg);

            if (fixedPattern) {
              const retryResult = await play(fixedPattern);
              if (retryResult.ok) break;
              lastError = retryResult.error ?? "Unknown error";
              lastCode = fixedPattern;
            } else {
              break; // Claude didn't produce a code block
            }
          }
        }
      }
    },
    [sendMessage, play],
  );

  // Show loading screen while browser initializes
  if (browserStatus === "loading") {
    return (
      <Box flexDirection="column" padding={1}>
        <Header />
        <Box paddingLeft={1} marginTop={1}>
          <Text color="yellow">Starting audio engine...</Text>
        </Box>
      </Box>
    );
  }

  if (browserStatus === "error") {
    return (
      <Box flexDirection="column" padding={1}>
        <Header />
        <Box paddingLeft={1} marginTop={1}>
          <Text color="red">
            Failed to start audio engine. Is Chromium installed?
          </Text>
        </Box>
        <Box paddingLeft={1}>
          <Text dimColor>Run: npx playwright install chromium</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Header />
      <ChatArea messages={messages} streamingText={streamingText} />
      <PatternDisplay pattern={currentPattern} />
      <StatusBar playbackState={playbackState} error={error} />
      <Box paddingLeft={1} marginTop={1}>
        <Text bold color="green">
          {"❯ "}
        </Text>
        <TextInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          placeholder={
            isStreaming ? "Claude is thinking..." : "Describe your music..."
          }
        />
      </Box>
    </Box>
  );
}
