import type { RPCSchema } from "electrobun/bun";
import type { Message } from "./types";

export type RiffRPC = {
  bun: RPCSchema<{
    requests: {
      startStream: {
        params: { messages: Message[] };
        response: { ok: boolean };
      };
      abortStream: {
        params: Record<string, never>;
        response: { ok: boolean };
      };
    };
    messages: Record<string, never>;
  }>;
  webview: RPCSchema<{
    requests: Record<string, never>;
    messages: {
      streamDelta: { delta: string };
      streamDone: Record<string, never>;
      streamError: { error: string };
    };
  }>;
};
