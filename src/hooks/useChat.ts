import { useState, useCallback, useRef } from "react";
import { streamResponse } from "../services/claude.js";
import { extractPattern } from "../lib/pattern-extractor.js";
import type { Message } from "../lib/types.js";

interface UseChatReturn {
  messages: Message[];
  streamingText: string;
  isStreaming: boolean;
  isBusy: boolean;
  sendMessage: (text: string) => Promise<string | null>;
  abortStream: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesRef = useRef<Message[]>([]);
  const busyRef = useRef(false);
  const idCounter = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const nextId = () => String(++idCounter.current);

  const abortStream = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const sendMessage = useCallback(
    async (text: string): Promise<string | null> => {
      if (busyRef.current) return null;
      busyRef.current = true;

      const controller = new AbortController();
      abortRef.current = controller;

      const userMsg: Message = { id: nextId(), role: "user", content: text };
      const updated = [...messagesRef.current, userMsg];
      messagesRef.current = updated;
      setMessages([...updated]);
      setIsStreaming(true);
      setStreamingText("");

      const assistantId = nextId();
      let fullText = "";
      try {
        for await (const delta of streamResponse(updated, controller.signal)) {
          fullText += delta;
          setStreamingText(fullText);
          setMessages([
            ...updated,
            { id: assistantId, role: "assistant", content: fullText },
          ]);
        }
      } catch (err: any) {
        if (!controller.signal.aborted) {
          fullText = `Error: ${err.message}`;
        }
      }

      // If aborted, keep partial text as the response
      if (controller.signal.aborted && !fullText) {
        fullText = "(cancelled)";
      }

      const pattern = extractPattern(fullText);
      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: fullText,
        pattern: pattern ?? undefined,
      };
      const final = [...updated, assistantMsg];
      messagesRef.current = final;
      setMessages(final);
      setStreamingText("");
      setIsStreaming(false);
      busyRef.current = false;
      abortRef.current = null;

      return pattern;
    },
    [],
  );

  return { messages, streamingText, isStreaming, isBusy: busyRef.current, sendMessage, abortStream };
}

/**
 * Build a retry message for when Strudel evaluation fails.
 * This is appended to conversation so Claude can self-correct.
 */
export function buildRetryMessage(code: string, error: string): string {
  return `The pattern you generated failed to evaluate with this error:\n\`\`\`\n${error}\n\`\`\`\nOriginal code:\n\`\`\`strudel\n${code}\n\`\`\`\nPlease fix the code. Remember: no variable declarations, no .play(), just a single Strudel expression.`;
}
