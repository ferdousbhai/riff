import { chromium, type Browser, type Page } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLAYER_PATH = join(__dirname, "../../browser/player.html");

let browser: Browser | null = null;
let page: Page | null = null;

export async function launchBrowser(): Promise<Page> {
  if (page) return page;

  // Must use headed mode — headless Chromium has no audio device.
  // Position off-screen to keep it out of sight on floating WMs.
  browser = await chromium.launch({
    headless: false,
    args: [
      "--autoplay-policy=no-user-gesture-required",
      "--window-position=-2000,-2000",
      "--window-size=400,300",
    ],
  });

  const context = await browser.newContext();
  page = await context.newPage();

  // Forward browser console to Node for debugging
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.error(`[browser] ${msg.text()}`);
    }
  });
  page.on("pageerror", (err) => {
    console.error(`[browser] Page error: ${err.message}`);
  });

  await page.goto(`file://${PLAYER_PATH}`);

  // Click init — autoplay policy flag means no real gesture needed
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
