import { useCallback, useRef, useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { keymap } from "@codemirror/view";
import { PlaybackControls } from "./PlaybackControls";
import type { PlaybackState, EvalResult } from "../../shared/types";

interface EditorPanelProps {
  code: string;
  onCodeChange: (code: string) => void;
  playbackState: PlaybackState;
  error: string | null;
  onPlay: (code: string) => Promise<EvalResult>;
  onStop: () => void;
}

export function EditorPanel({
  code,
  onCodeChange,
  playbackState,
  error,
  onPlay,
  onStop,
}: EditorPanelProps) {
  // Ref keeps code in sync for keymap callbacks (closures capture stale props)
  const codeRef = useRef(code);
  codeRef.current = code;

  const handlePlay = useCallback(() => {
    if (codeRef.current.trim()) {
      onPlay(codeRef.current);
    }
  }, [onPlay]);

  const extensions = useMemo(
    () => [
      javascript(),
      keymap.of([
        {
          key: "Ctrl-Enter",
          run: () => {
            handlePlay();
            return true;
          },
        },
      ]),
    ],
    [handlePlay],
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <span className="text-sm font-medium text-gray-400">
          Pattern Editor
        </span>
        <PlaybackControls
          playbackState={playbackState}
          onPlay={handlePlay}
          onStop={onStop}
        />
      </div>

      <div className="flex-1 overflow-hidden">
        <CodeMirror
          value={code}
          onChange={onCodeChange}
          theme={oneDark}
          extensions={extensions}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLine: true,
            autocompletion: false,
          }}
          className="h-full"
        />
      </div>

      {error && playbackState === "error" && (
        <div className="px-4 py-2 text-xs text-red-400 bg-red-900/20 border-t border-red-900/30 truncate">
          {error}
        </div>
      )}
    </div>
  );
}
