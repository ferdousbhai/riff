#!/usr/bin/env node
import "dotenv/config";
import React from "react";
import { render } from "ink";
import { App } from "./app.js";
import { closeBrowser } from "./services/browser.js";

// Validate API key early
if (!process.env.ANTHROPIC_API_KEY) {
  console.error(
    "Missing ANTHROPIC_API_KEY. Copy .env.example to .env and add your key.",
  );
  process.exit(1);
}

// Ensure browser is cleaned up on any exit
async function cleanup() {
  await closeBrowser().catch(() => {});
}

process.on("SIGINT", async () => {
  await cleanup();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await cleanup();
  process.exit(0);
});

process.on("unhandledRejection", async () => {
  await cleanup();
  process.exit(1);
});

const { waitUntilExit } = render(<App />);

waitUntilExit().then(async () => {
  await cleanup();
  process.exit(0);
});
