# Riff

AI-powered music production TUI. Users describe music in natural language, Claude generates Strudel live-coding patterns, a hidden browser plays audio.

## Stack

- **TypeScript + Ink** (React for CLIs) — TUI rendering
- **Playwright** — hidden Chromium for Strudel/Web Audio playback
- **@anthropic-ai/sdk** — Claude Sonnet 4.5 streaming
- **@strudel/web 1.3.0** — music engine loaded via CDN in browser

## Commands

- `pnpm start` — run the TUI (requires `ANTHROPIC_API_KEY` in `.env`)
- `pnpm dev` — run with watch mode
- `pnpm build` — compile TypeScript to `dist/`
- `pnpm tsc --noEmit` — type check without emitting
- `pnpm playwright install chromium` — install browser (required once)

## Architecture

```
src/
  index.tsx              # Entry point, env validation, cleanup handlers
  app.tsx                # Root Ink component, keybindings, auto-retry loop
  components/            # Ink UI components (Header, ChatArea, PatternDisplay, StatusBar)
  hooks/
    useChat.ts           # Conversation state + Claude streaming (busyRef guards concurrency)
    usePlayback.ts       # Browser lifecycle + play/stop state
  services/
    browser.ts           # Playwright launch (headless:false, off-screen) + page management
    claude.ts            # Async generator streaming wrapper over Anthropic SDK
    strudel-bridge.ts    # evaluatePattern() / stopPlayback() via page.evaluate()
  lib/
    system-prompt.ts     # Strudel reference taught to Claude
    pattern-extractor.ts # Regex extraction of ```strudel code blocks
    types.ts             # Message, PlaybackState, EvalResult
browser/
  player.html            # Loaded by Playwright; exposes __evaluate/__hush/__isReady
```

## Key patterns

- **Audio requires headed browser**: Chromium headless can't do Web Audio. We launch `headless: false` with `--window-position=-2000,-2000` to hide it off-screen.
- **Autoplay policy**: `player.html` has an init button that Playwright clicks to satisfy browser autoplay restrictions.
- **busyRef in useChat**: `useCallback` closures capture stale state, so a `useRef` guards against concurrent `sendMessage` calls instead of relying on `isStreaming` state.
- **Static keys**: Ink's `<Static>` renders items once — keys must be stable IDs (message.id), never array indices.
- **Auto-retry**: If generated Strudel code fails evaluation, the error is sent back to Claude (max 2 retries) for self-correction.
- **Strudel keyboard conventions**: Ctrl+. stops playback (same as Strudel REPL's hush shortcut). Enter sends messages (analogous to Ctrl+Enter evaluate).

## Strudel API (in browser context)

- `initStrudel()` — initialize audio engine
- `evaluate(code, true)` — transpile + autoplay a pattern
- `hush()` — stop all playback

## Environment

Requires `ANTHROPIC_API_KEY` in `.env` (see `.env.example`).
