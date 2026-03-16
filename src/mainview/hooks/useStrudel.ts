import { useRef, useCallback, useState } from "react";
import type { EvalResult } from "../../shared/types";

export function useStrudel() {
  const [isReady, setIsReady] = useState(false);
  const strudelRef = useRef<typeof import("@strudel/web") | null>(null);
  const initPromiseRef = useRef<Promise<void> | null>(null);
  const initErrorRef = useRef<string | null>(null);

  const init = useCallback(async () => {
    if (strudelRef.current) return;
    // If already initializing, wait for that attempt instead of bailing out
    if (initPromiseRef.current) return initPromiseRef.current;

    initErrorRef.current = null;

    const promise = (async () => {
      console.log("[Strudel] Starting init...");
      const strudel = await import("@strudel/web");
      console.log("[Strudel] Module imported");

      // Pre-create AudioContext before initStrudel() to bypass initAudioOnFirstClick()
      const ctx = new AudioContext();
      console.log("[Strudel] AudioContext state:", ctx.state);
      await ctx.resume();
      console.log("[Strudel] AudioContext resumed:", ctx.state);
      strudel.setAudioContext(ctx);

      await strudel.initStrudel({
        prebake: () =>
          strudel.samples("github:tidalcycles/Dirt-Samples/master"),
      });
      console.log("[Strudel] initStrudel done");

      await strudel.initAudio();
      console.log("[Strudel] initAudio done");

      strudelRef.current = strudel;
      setIsReady(true);
    })();

    initPromiseRef.current = promise;

    try {
      await promise;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      initErrorRef.current = message;
      console.error("[Strudel] Init failed:", message);
      initPromiseRef.current = null; // Allow retry
      throw err;
    }
  }, []);

  const evaluate = useCallback(async (code: string): Promise<EvalResult> => {
    const strudel = strudelRef.current;
    if (!strudel) {
      const reason = initErrorRef.current
        ? `Audio engine failed to initialize: ${initErrorRef.current}`
        : "Audio engine not initialized — try clicking Play to retry";
      return { ok: false, error: reason };
    }

    try {
      const ctx = strudel.getAudioContext();
      if (ctx.state === "suspended") await ctx.resume();

      await strudel.evaluate(code, true);
      return { ok: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, error: message };
    }
  }, []);

  const hush = useCallback(() => {
    strudelRef.current?.hush();
  }, []);

  return { isReady, init, evaluate, hush };
}
