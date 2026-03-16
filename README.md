# Riff

AI-powered music production desktop app. Describe music in natural language, Claude generates [Strudel](https://strudel.cc/) live-coding patterns, and audio plays natively in the webview.

Split-pane layout: editable code editor (left) + chat (right).

## Stack

- **Electrobun** — lightweight desktop framework (Bun runtime + system webview)
- **React + Tailwind CSS** — UI
- **CodeMirror 6** — code editor
- **@strudel/web** — music engine (Web Audio API)
- **Claude API** — pattern generation via streaming

## Setup

```bash
bun install
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
```

### Linux dependencies

WebKitGTK requires GStreamer plugins for audio:

```bash
# Arch Linux
yay -S gst-plugins-base gst-plugins-good
```

## Usage

```bash
bun run start        # Build + launch
bun run dev:hmr      # Launch with Vite HMR
bun run test         # Run tests
```

### Keyboard shortcuts

- **Enter** — send message
- **Ctrl+Enter** — evaluate code in editor
- **Ctrl+.** — stop playback
- **Escape** — cancel stream
