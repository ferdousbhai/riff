/**
 * Extract the last Strudel code block from a markdown response.
 * Looks for ```strudel or ```js fenced code blocks.
 * Returns the code string or null if none found.
 */
export function extractPattern(text: string): string | null {
  // Only match fenced code blocks with strudel, js, or javascript lang hints.
  // Bare ``` blocks are ignored to avoid extracting non-Strudel code.
  const regex = /```(?:strudel|js|javascript)\s*\n([\s\S]*?)```/g;
  let lastMatch: string | null = null;

  let match;
  while ((match = regex.exec(text)) !== null) {
    const code = match[1].trim();
    if (code) lastMatch = code;
  }

  return lastMatch;
}
