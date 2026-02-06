import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "../lib/system-prompt.js";
import type { Message } from "../lib/types.js";

const client = new Anthropic();

/**
 * Stream a Claude response as an async generator of text deltas.
 * Yields partial text as it arrives for real-time TUI updates.
 */
export async function* streamResponse(
  messages: Message[],
): AsyncGenerator<string> {
  const stream = client.messages.stream({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}
