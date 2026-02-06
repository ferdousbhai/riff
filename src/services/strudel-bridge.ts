import { getPage } from "./browser.js";
import type { EvalResult } from "../lib/types.js";

export async function evaluatePattern(code: string): Promise<EvalResult> {
  const page = getPage();
  if (!page) return { ok: false, error: "Browser not launched" };

  return await page.evaluate(async (c: string) => {
    return await (window as any).__evaluate(c);
  }, code);
}

export async function stopPlayback(): Promise<EvalResult> {
  const page = getPage();
  if (!page) return { ok: false, error: "Browser not launched" };

  return await page.evaluate(() => {
    return (window as any).__hush();
  });
}
