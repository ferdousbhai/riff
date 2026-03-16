interface CodeBlockRendererProps {
  text: string;
}

export function CodeBlockRenderer({ text }: CodeBlockRendererProps) {
  const parts = text.split(/(```[\s\S]*?```|```[\s\S]*$)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("```")) {
          const lines = part.split("\n");
          const code = lines.slice(1).join("\n").replace(/```$/, "").trim();
          return (
            <pre
              key={i}
              className="my-2 p-3 bg-black/30 rounded text-green-300 font-mono text-xs overflow-x-auto"
            >
              {code}
            </pre>
          );
        }
        return part ? (
          <span key={i} className="whitespace-pre-wrap">
            {part}
          </span>
        ) : null;
      })}
    </>
  );
}
