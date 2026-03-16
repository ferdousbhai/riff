/**
 * Extract the last Strudel code block from a markdown response.
 * Matches ```strudel, ```js, or ```javascript fenced blocks.
 * Bare ``` blocks are ignored to avoid extracting non-Strudel code.
 */
export function extractPattern(text: string): string | null {
  const matches = [
    ...text.matchAll(/```(?:strudel|js|javascript)\s*\n([\s\S]*?)```/g),
  ];

  for (let i = matches.length - 1; i >= 0; i--) {
    const code = matches[i][1].trim();
    if (code) return code;
  }

  return null;
}
