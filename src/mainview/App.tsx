import { useState, useCallback, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { EditorPanel } from "./components/EditorPanel";
import { ChatPanel } from "./components/ChatPanel";
import { useChat, buildRetryMessage } from "./hooks/useChat";
import { usePlayback } from "./hooks/usePlayback";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

const MAX_RETRIES = 2;

export function App() {
  const [code, setCode] = useState("");
  const { messages, streamingText, isStreaming, sendMessage, abortStream } =
    useChat();
  const { isReady, playbackState, error, initAudio, play, stop } =
    usePlayback();

  useEffect(() => {
    // Autoplay policy may block -- will retry on first user interaction
    initAudio().catch(() => {});
  }, [initAudio]);

  useKeyboardShortcuts({
    onStop: stop,
    onAbort: abortStream,
    isStreaming,
  });

  const ensureAudio = useCallback(async () => {
    if (!isReady) await initAudio();
  }, [isReady, initAudio]);

  const handleSendMessage = useCallback(
    async (text: string) => {
      await ensureAudio();

      const pattern = await sendMessage(text);
      if (!pattern) return;

      setCode(pattern);
      const result = await play(pattern);
      if (result.ok || !result.error) return;

      // Auto-retry: if evaluation fails, ask Claude to fix (up to MAX_RETRIES)
      let lastError = result.error;
      let lastCode = pattern;

      for (let i = 0; i < MAX_RETRIES; i++) {
        const fixedPattern = await sendMessage(
          buildRetryMessage(lastCode, lastError),
        );
        if (!fixedPattern) break;

        setCode(fixedPattern);
        const retryResult = await play(fixedPattern);
        if (retryResult.ok) break;

        lastError = retryResult.error ?? "Unknown error";
        lastCode = fixedPattern;
      }
    },
    [ensureAudio, sendMessage, play],
  );

  const handlePlay = useCallback(
    async (editorCode: string) => {
      await ensureAudio();
      return play(editorCode);
    },
    [ensureAudio, play],
  );

  return (
    <div className="h-screen bg-surface text-white">
      <PanelGroup direction="horizontal" className="h-full">
        <Panel defaultSize={55} minSize={30}>
          <EditorPanel
            code={code}
            onCodeChange={setCode}
            playbackState={playbackState}
            error={error}
            onPlay={handlePlay}
            onStop={stop}
          />
        </Panel>

        <PanelResizeHandle className="w-1 bg-white/5 hover:bg-accent/50 transition-colors cursor-col-resize" />

        <Panel defaultSize={45} minSize={25}>
          <ChatPanel
            messages={messages}
            streamingText={streamingText}
            isStreaming={isStreaming}
            onSendMessage={handleSendMessage}
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}
