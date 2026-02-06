import { chromium, type Browser, type Page } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLAYER_PATH = join(__dirname, "../../browser/player.html");

let browser: Browser | null = null;
let page: Page | null = null;

export async function launchBrowser(): Promise<Page> {
  if (page) return page;

  // Use headless mode with autoplay policy disabled.
  // This avoids any visible browser window (critical for tiling WMs)
  // and removes the need for a user-gesture click to init audio.
  browser = await chromium.launch({
    headless: true,
    args: ["--autoplay-policy=no-user-gesture-required"],
  });

  const context = await browser.newContext();
  page = await context.newPage();
  await page.goto(`file://${PLAYER_PATH}`);

  // Classic <script> loads synchronously — __isReady is defined immediately.
  // Trigger init — no user gesture needed with autoplay policy disabled.
  await page.click("#init");

  // Wait for Strudel to finish initializing
  await page.waitForFunction(() => (window as any).__isReady(), {
    timeout: 30_000,
  });

  return page;
}

export function getPage(): Page | null {
  return page;
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close().catch(() => {});
    browser = null;
    page = null;
  }
}
