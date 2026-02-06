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
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesRef = useRef<Message[]>([]);
  const busyRef = useRef(false);
  const idCounter = useRef(0);

  const nextId = () => String(++idCounter.current);

  const sendMessage = useCallback(
    async (text: string): Promise<string | null> => {
      if (busyRef.current) return null;
      busyRef.current = true;

      const userMsg: Message = { id: nextId(), role: "user", content: text };
      const updated = [...messagesRef.current, userMsg];
      messagesRef.current = updated;
      setMessages([...updated]);
      setIsStreaming(true);
      setStreamingText("");

      const assistantId = nextId();
      let fullText = "";
      try {
        for await (const delta of streamResponse(updated)) {
          fullText += delta;
          setStreamingText(fullText);
          setMessages([
            ...updated,
            { id: assistantId, role: "assistant", content: fullText },
          ]);
        }
      } catch (err: any) {
        fullText = `Error: ${err.message}`;
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

      return pattern;
    },
    [],
  );

  return { messages, streamingText, isStreaming, isBusy: busyRef.current, sendMessage };
}

/**
 * Build a retry message for when Strudel evaluation fails.
 * This is appended to conversation so Claude can self-correct.
 */
export function buildRetryMessage(code: string, error: string): string {
  return `The pattern you generated failed to evaluate with this error:\n\`\`\`\n${error}\n\`\`\`\nOriginal code:\n\`\`\`strudel\n${code}\n\`\`\`\nPlease fix the code. Remember: no variable declarations, no .play(), just a single Strudel expression.`;
}
