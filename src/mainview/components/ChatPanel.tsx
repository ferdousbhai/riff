import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { MessageBubble } from "./MessageBubble";
import { StreamingText } from "./StreamingText";
import type { Message } from "../../shared/types";

interface ChatPanelProps {
  messages: Message[];
  streamingText: string;
  isStreaming: boolean;
  onSendMessage: (text: string) => void;
}

export function ChatPanel({
  messages,
  streamingText,
  isStreaming,
  onSendMessage,
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingText]);

  const handleSubmit = useCallback(() => {
    const text = inputValue.trim();
    if (!text || isStreaming) return;
    setInputValue("");
    onSendMessage(text);
  }, [inputValue, isStreaming, onSendMessage]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b border-white/10">
        <span className="text-sm font-medium text-gray-400">Riff Chat</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 && !streamingText && (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Describe the music you want to create
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {streamingText && isStreaming && (
          <div className="flex justify-start mb-3">
            <div className="max-w-[85%] px-3 py-2 rounded-lg bg-surface-lighter text-gray-200">
              <StreamingText text={streamingText} />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 p-3">
        <div className="flex gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isStreaming ? "Claude is thinking..." : "Describe your music..."
            }
            disabled={isStreaming}
            rows={1}
            className="flex-1 bg-surface-lighter border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-accent/50 disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={isStreaming || !inputValue.trim()}
            className="px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg text-sm text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        <div className="mt-1.5 text-[10px] text-gray-600">
          Enter to send · Shift+Enter for newline · Escape to cancel stream ·
          Ctrl+. to stop playback
        </div>
      </div>
    </div>
  );
}
