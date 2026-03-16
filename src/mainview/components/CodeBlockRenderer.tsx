interface CodeBlockRendererProps {
  text: string;
}

function parseCodeBlock(raw: string): string {
  const lines = raw.split("\n");
  return lines.slice(1).join("\n").replace(/```$/, "").trim();
}

export function CodeBlockRenderer({ text }: CodeBlockRendererProps) {
  const parts = text.split(/(```[\s\S]*?```|```[\s\S]*$)/g).filter(Boolean);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("```")) {
          return (
            <pre
              key={i}
              className="my-2 p-3 bg-black/30 rounded text-green-300 font-mono text-xs overflow-x-auto"
            >
              {parseCodeBlock(part)}
            </pre>
          );
        }
        return (
          <span key={i} className="whitespace-pre-wrap">
            {part}
          </span>
        );
      })}
    </>
  );
}
