import { useRef, useCallback, useState } from "react";
import type { EvalResult } from "../../shared/types";

export function useStrudel() {
  const [isReady, setIsReady] = useState(false);
  const strudelRef = useRef<typeof import("@strudel/web") | null>(null);
  const initializingRef = useRef(false);

  const init = useCallback(async () => {
    if (strudelRef.current || initializingRef.current) return;
    initializingRef.current = true;

    try {
      const strudel = await import("@strudel/web");

      // Pre-create a running AudioContext and inject it into Strudel
      // BEFORE calling initStrudel(). This ensures the audio pipeline
      // is active from the start, bypassing initAudioOnFirstClick().
      const ctx = new AudioContext();
      await ctx.resume();
      strudel.setAudioContext(ctx);

      await strudel.initStrudel({
        prebake: async () => {
          await strudel.samples("github:tidalcycles/Dirt-Samples/master");
        },
      });

      // Eagerly initialize superdough audio engine (loads AudioWorklets).
      await strudel.initAudio();
      strudelRef.current = strudel;
      setIsReady(true);
    } catch (err) {
      initializingRef.current = false;
      throw err;
    }
  }, []);

  const evaluate = useCallback(async (code: string): Promise<EvalResult> => {
    const strudel = strudelRef.current;
    if (!strudel) return { ok: false, error: "Strudel not initialized" };

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
