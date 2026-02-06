import { useState, useCallback, useEffect, useRef } from "react";
import { launchBrowser, closeBrowser } from "../services/browser.js";
import {
  evaluatePattern,
  stopPlayback as bridgeStop,
} from "../services/strudel-bridge.js";
import type { PlaybackState, EvalResult } from "../lib/types.js";

interface UsePlaybackReturn {
  playbackState: PlaybackState;
  currentPattern: string | null;
  error: string | null;
  initBrowser: () => Promise<void>;
  play: (code: string) => Promise<EvalResult>;
  stop: () => Promise<void>;
  shutdown: () => Promise<void>;
}

export function usePlayback(): UsePlaybackReturn {
  const [playbackState, setPlaybackState] = useState<PlaybackState>("stopped");
  const [currentPattern, setCurrentPattern] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const browserReady = useRef(false);

  const initBrowser = useCallback(async () => {
    if (browserReady.current) return;
    setPlaybackState("loading");
    setError(null);
    try {
      await launchBrowser();
      browserReady.current = true;
      setPlaybackState("stopped");
    } catch (err: any) {
      setError(`Browser init failed: ${err.message}`);
      setPlaybackState("error");
    }
  }, []);

  const play = useCallback(async (code: string): Promise<EvalResult> => {
    setError(null);
    setPlaybackState("loading");
    const result = await evaluatePattern(code);
    if (result.ok) {
      setCurrentPattern(code);
      setPlaybackState("playing");
    } else {
      setError(result.error ?? "Unknown evaluation error");
      setPlaybackState("error");
    }
    return result;
  }, []);

  const stop = useCallback(async () => {
    try {
      await bridgeStop();
      setPlaybackState("stopped");
      setError(null);
    } catch {
      // Swallow errors — stop is best-effort
      setPlaybackState("stopped");
    }
  }, []);

  const shutdown = useCallback(async () => {
    await bridgeStop().catch(() => {});
    await closeBrowser();
    browserReady.current = false;
    setPlaybackState("stopped");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      closeBrowser().catch(() => {});
    };
  }, []);

  return {
    playbackState,
    currentPattern,
    error,
    initBrowser,
    play,
    stop,
    shutdown,
  };
}
