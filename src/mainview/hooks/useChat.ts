import { useState, useCallback, useRef, useEffect } from "react";
import { extractPattern } from "../../shared/pattern-extractor";
import { electroview, setStreamHandler } from "../rpc";
import type { Message } from "../../shared/types";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesRef = useRef<Message[]>([]);
  const busyRef = useRef(false);
  const idCounter = useRef(0);
  const resolveStreamRef = useRef<(() => void) | null>(null);
  const fullTextRef = useRef("");
  const assistantIdRef = useRef("");
  const updatedRef = useRef<Message[]>([]);

  function nextId(): string {
    return String(++idCounter.current);
  }

  useEffect(() => {
    setStreamHandler({
      onDelta: (delta) => {
        fullTextRef.current += delta;
        const text = fullTextRef.current;
        setStreamingText(text);
        setMessages([
          ...updatedRef.current,
          {
            id: assistantIdRef.current,
            role: "assistant",
            content: text,
          },
        ]);
      },
      onDone: () => resolveStreamRef.current?.(),
      onError: (error) => {
        fullTextRef.current = `Error: ${error}`;
        resolveStreamRef.current?.();
      },
    });

    return () => setStreamHandler({});
  }, []);

  const abortStream = useCallback(() => {
    electroview.rpc!.request.abortStream({});
    resolveStreamRef.current?.();
  }, []);

  const sendMessage = useCallback(
    async (text: string): Promise<string | null> => {
      if (busyRef.current) return null;
      busyRef.current = true;

      const userMsg: Message = { id: nextId(), role: "user", content: text };
      const updated = [...messagesRef.current, userMsg];
      messagesRef.current = updated;
      updatedRef.current = updated;
      setMessages([...updated]);
      setIsStreaming(true);
      setStreamingText("");
      fullTextRef.current = "";
      assistantIdRef.current = nextId();

      await new Promise<void>((resolve) => {
        resolveStreamRef.current = resolve;
        electroview.rpc!.request.startStream({ messages: updated });
      });

      const fullText = fullTextRef.current;
      const pattern = extractPattern(fullText);
      const assistantMsg: Message = {
        id: assistantIdRef.current,
        role: "assistant",
        content: fullText,
        pattern: pattern || undefined,
      };
      const final = [...updated, assistantMsg];
      messagesRef.current = final;
      setMessages(final);
      setStreamingText("");
      setIsStreaming(false);
      busyRef.current = false;
      resolveStreamRef.current = null;

      return pattern;
    },
    [],
  );

  return { messages, streamingText, isStreaming, sendMessage, abortStream };
}

export function buildRetryMessage(code: string, error: string): string {
  return `The pattern you generated failed to evaluate with this error:\n\`\`\`\n${error}\n\`\`\`\nOriginal code:\n\`\`\`strudel\n${code}\n\`\`\`\nPlease fix the code. Remember: no variable declarations, no .play(), just a single Strudel expression.`;
}
