# Riff

AI-powered music production desktop app. Users describe music in natural language, Claude generates Strudel live-coding patterns, audio plays natively in the webview. Split-pane layout: editable code editor (left) + chat (right).

## Stack

- **Electrobun** — lightweight desktop app framework (Bun runtime + system webview)
- **React + Tailwind CSS** — view UI with dark theme
- **Vite** — React build/HMR
- **CodeMirror 6** — editable Strudel code editor (JavaScript + oneDark theme)
- **react-resizable-panels** — split-pane layout
- **@strudel/web 1.3.0** — music engine (direct import in webview)
- **@anthropic-ai/sdk** — Claude streaming (Bun main process, streamed to webview via RPC)

## Commands

- `bun run start` — build Vite + launch Electrobun dev
- `bun run dev:hmr` — launch with Vite HMR for hot reload
- `bun run dev` — Electrobun dev with file watching (no HMR)
- `bun run build:canary` — build for canary release
- `bun run test` — run vitest suite

## Architecture

```
src/
  bun/                             # Electrobun main process (Bun runtime)
    index.ts                       # Window creation, RPC handlers, Claude streaming
  mainview/                        # React UI (system webview)
    index.html                     # HTML entry point
    main.tsx                       # createRoot entry + RPC init
    App.tsx                        # Split-pane root (EditorPanel | ChatPanel)
    app.css                        # Tailwind imports + global styles
    rpc.ts                         # Electroview RPC bridge (stream handler callbacks)
    components/
      EditorPanel.tsx              # CodeMirror editor + playback controls
      ChatPanel.tsx                # Messages + input
      PlaybackControls.tsx         # Play/Stop buttons
      MessageBubble.tsx            # Chat message rendering
      StreamingText.tsx            # Animated streaming response
      CodeBlockRenderer.tsx        # Markdown code block rendering
    hooks/
      useChat.ts                   # RPC-based Claude streaming + state
      useStrudel.ts                # Direct @strudel/web wrapper
      usePlayback.ts               # Wraps useStrudel with state
      useKeyboardShortcuts.ts      # Ctrl+., Escape handlers
  shared/                          # Imported by both bun and mainview
    types.ts                       # Message, PlaybackState, EvalResult
    rpc-schema.ts                  # Typed RPC schema (replaces IPC channels)
    pattern-extractor.ts           # Regex code block extraction
```

## Data Flow

```
User types message → ChatPanel → RPC request startStream →
  Bun process: client.messages.stream() →
  RPC message streamDelta per token → ChatPanel renders streaming text →
  RPC message streamDone → extractPattern() → auto-populate EditorPanel →
  User clicks Play (or auto-play) → useStrudel.evaluate(code) →
  @strudel/web plays audio natively in webview
```

## RPC Schema

| Name | Direction | Type | Purpose |
|------|-----------|------|---------|
| `startStream` | webview→bun | request | Start Claude streaming |
| `abortStream` | webview→bun | request | Cancel stream |
| `streamDelta` | bun→webview | message | Text token (fire-and-forget) |
| `streamDone` | bun→webview | message | Stream complete |
| `streamError` | bun→webview | message | Stream error |

## Key Patterns

- **Strudel runs in webview**: `@strudel/web` imports directly in the webview with Web Audio API support. CEF bundled on Linux for WebKitGTK compatibility.
- **RPC streaming**: Claude tokens stream from bun→webview via `rpc.send.streamDelta()`. The `setStreamHandler` pattern bridges Electrobun's module-level RPC handlers with React's hook state.
- **busyRef in useChat**: `useRef` guards against concurrent `sendMessage` calls (closures capture stale state).
- **Auto-retry**: If generated Strudel code fails evaluation, the error is sent back to Claude (max 2 retries).
- **Strudel audio init**: Must pre-create AudioContext via `new AudioContext()` + `ctx.resume()` + `setAudioContext(ctx)` BEFORE `initStrudel()`.
- **Dirt-Samples**: `samples("github:tidalcycles/Dirt-Samples/master")` must be called in `initStrudel({ prebake })` to load bd/sd/hh/cp etc. Without this, `s()` patterns produce no sound.
- **No dotenv needed**: Bun reads `.env` files automatically before user code runs. Top-level Anthropic client initialization is safe.
- **ApplicationMenu required**: Electrobun needs explicit menu setup for Cmd+C/V/X to work in the webview.
- **Keyboard shortcuts**: Ctrl+. stops playback, Escape cancels stream, Enter sends messages, Ctrl+Enter evaluates code in editor.

## Strudel API (webview context)

- `initStrudel()` — initialize audio engine
- `evaluate(code, true)` — transpile + autoplay a pattern
- `hush()` — stop all playback

## Environment

- `ANTHROPIC_API_KEY` — required (in `.env`)
- `CLAUDE_MODEL` — optional, defaults to `claude-sonnet-4-6`
