import { CodeBlockRenderer } from "./CodeBlockRenderer";

interface StreamingTextProps {
  text: string;
}

export function StreamingText({ text }: StreamingTextProps) {
  return (
    <div className="whitespace-pre-wrap text-sm leading-relaxed">
      <CodeBlockRenderer text={text} />
      <span className="animate-pulse text-accent-light">|</span>
    </div>
  );
}
