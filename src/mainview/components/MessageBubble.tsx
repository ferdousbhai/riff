import { CodeBlockRenderer } from "./CodeBlockRenderer";
import type { Message } from "../../shared/types";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[85%] px-3 py-2 rounded-lg ${
          isUser
            ? "bg-accent/30 text-white"
            : "bg-surface-lighter text-gray-200"
        }`}
      >
        {isUser ? (
          <p className="text-sm">{message.content}</p>
        ) : (
          <div className="text-sm leading-relaxed">
            <CodeBlockRenderer text={message.content} />
          </div>
        )}
      </div>
    </div>
  );
}
