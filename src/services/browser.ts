import { chromium, type Browser, type Page } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLAYER_PATH = join(__dirname, "../../browser/player.html");

let browser: Browser | null = null;
let page: Page | null = null;

export async function launchBrowser(): Promise<Page> {
  if (page) return page;

  browser = await chromium.launch({
    headless: false,
    args: [
      "--window-position=-2000,-2000", // move off-screen
      "--window-size=400,300",
    ],
  });

  const context = await browser.newContext();
  page = await context.newPage();
  await page.goto(`file://${PLAYER_PATH}`);

  // Click the init button to satisfy autoplay policy
  await page.click("#init");

  // Wait for Strudel to initialize
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
