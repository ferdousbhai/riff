# Riff

AI-powered music production TUI. Users describe music in natural language, Claude generates Strudel live-coding patterns, a hidden browser plays audio.

## Stack

- **TypeScript + Ink** (React for CLIs) — TUI rendering
- **Playwright** — headless Chromium for Strudel/Web Audio playback
- **@anthropic-ai/sdk** — Claude streaming (model configurable via `CLAUDE_MODEL` env var)
- **@strudel/web 1.3.0** — music engine, bundled locally via postinstall

## Commands

- `pnpm start` — run the TUI (requires `ANTHROPIC_API_KEY` in `.env`)
- `pnpm dev` — run with watch mode
- `pnpm build` — compile TypeScript to `dist/`
- `pnpm tsc --noEmit` — type check without emitting
- `pnpm test` — run vitest suite
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
    browser.ts           # Playwright launch (headless + --autoplay-policy flag)
    claude.ts            # Async generator streaming wrapper with AbortController + error mapping
    strudel-bridge.ts    # evaluatePattern() / stopPlayback() via page.evaluate()
  lib/
    system-prompt.ts     # Strudel reference taught to Claude
    pattern-extractor.ts # Regex extraction of ```strudel/js/javascript code blocks
    types.ts             # Message, PlaybackState, EvalResult
browser/
  player.html            # Loaded by Playwright; imports local strudel.mjs
  strudel.mjs            # (generated) copied from @strudel/web/dist via postinstall
  assets/                # (generated) Strudel worker files
```

## Key patterns

- **Headless with autoplay bypass**: Uses `headless: true` + `--autoplay-policy=no-user-gesture-required` Chrome flag. No visible browser window on any WM.
- **Local Strudel bundle**: `postinstall` copies `@strudel/web/dist` into `browser/` — no CDN dependency at runtime.
- **busyRef in useChat**: `useCallback` closures capture stale state, so a `useRef` guards against concurrent `sendMessage` calls.
- **AbortController for streaming**: Escape cancels in-flight Claude streams. AbortSignal passed to the SDK.
- **Static keys**: Ink's `<Static>` renders items once — keys must be stable IDs (message.id), never array indices.
- **Auto-retry**: If generated Strudel code fails evaluation, the error is sent back to Claude (max 2 retries).
- **Strudel keyboard conventions**: Ctrl+. stops playback, Escape cancels stream, Enter sends messages.
- **Friendly error messages**: SDK errors (401, 429, connection) mapped to actionable user messages in `claude.ts`.
- **Pattern extractor**: Only matches fenced blocks with `strudel`/`js`/`javascript` tags — bare blocks ignored.

## Strudel API (in browser context)

- `initStrudel()` — initialize audio engine
- `evaluate(code, true)` — transpile + autoplay a pattern
- `hush()` — stop all playback

## Environment

- `ANTHROPIC_API_KEY` — required (see `.env.example`)
- `CLAUDE_MODEL` — optional, defaults to `claude-sonnet-4-5-20250929`
