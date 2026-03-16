import type { PlaybackState } from "../../shared/types";

interface PlaybackControlsProps {
  playbackState: PlaybackState;
  onPlay: () => void;
  onStop: () => void;
}

export function PlaybackControls({
  playbackState,
  onPlay,
  onStop,
}: PlaybackControlsProps) {
  const isPlaying = playbackState === "playing";
  const isLoading = playbackState === "loading";

  return (
    <div className="flex items-center gap-2">
      {isPlaying ? (
        <button
          onClick={onStop}
          className="flex items-center gap-1.5 px-3 py-1 text-sm bg-red-600/80 hover:bg-red-600 rounded transition-colors"
          title="Stop (Ctrl+.)"
        >
          <span className="inline-block w-2.5 h-2.5 bg-white rounded-sm" />
          Stop
        </button>
      ) : (
        <button
          onClick={onPlay}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1 text-sm bg-green-600/80 hover:bg-green-600 rounded transition-colors disabled:opacity-50"
          title="Play (Ctrl+Enter)"
        >
          <span className="inline-block w-0 h-0 border-l-[8px] border-l-white border-y-[5px] border-y-transparent" />
          {isLoading ? "Loading..." : "Play"}
        </button>
      )}
    </div>
  );
}
