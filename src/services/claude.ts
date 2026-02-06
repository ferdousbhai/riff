import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "../lib/system-prompt.js";
import type { Message } from "../lib/types.js";

const client = new Anthropic();
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-5-20250929";

/** Map SDK errors to user-friendly messages. */
function friendlyError(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError) {
    return "Invalid API key. Check ANTHROPIC_API_KEY in your .env file.";
  }
  if (err instanceof Anthropic.RateLimitError) {
    return "Rate limited by the API. Wait a moment and try again.";
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return "Connection failed. Check your internet connection.";
  }
  if (err instanceof Anthropic.APIError) {
    return `API error (${err.status}): ${err.message}`;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "Unknown error";
}

/**
 * Stream a Claude response as an async generator of text deltas.
 * Yields partial text as it arrives for real-time TUI updates.
 * Pass an AbortSignal to cancel the stream mid-flight.
 */
export async function* streamResponse(
  messages: Message[],
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const stream = client.messages.stream(
    {
      model: MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    },
    { signal },
  );

  try {
    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield event.delta.text;
      }
    }
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      (err.name === "AbortError" || signal?.aborted)
    ) {
      return;
    }
    throw new Error(friendlyError(err));
  }
}
