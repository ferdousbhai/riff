import { Electroview } from "electrobun/view";
import type { RiffRPC } from "../shared/rpc-schema";

interface StreamHandler {
  onDelta?: (delta: string) => void;
  onDone?: () => void;
  onError?: (error: string) => void;
}

let streamHandler: StreamHandler = {};

export function setStreamHandler(handler: StreamHandler) {
  streamHandler = handler;
}

const rpc = Electroview.defineRPC<RiffRPC>({
  handlers: {
    requests: {},
    messages: {
      streamDelta: ({ delta }) => streamHandler.onDelta?.(delta),
      streamDone: () => streamHandler.onDone?.(),
      streamError: ({ error }) => streamHandler.onError?.(error),
    },
  },
});

export const electroview = new Electroview({ rpc });
