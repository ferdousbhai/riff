import { describe, it, expect } from "vitest";
import { buildRetryMessage } from "./useChat.js";

describe("buildRetryMessage", () => {
  it("includes the error message and code in the output", () => {
    const result = buildRetryMessage("s('bd sd')", "ReferenceError: x is not defined");
    expect(result).toContain("ReferenceError: x is not defined");
    expect(result).toContain("s('bd sd')");
  });

  it("contains the fix instruction", () => {
    const result = buildRetryMessage("note('c3')", "some error");
    expect(result).toContain(
      "Please fix the code. Remember: no variable declarations, no .play(), just a single Strudel expression.",
    );
  });

  it("preserves triple backticks inside the error message", () => {
    const error = "Unexpected token ``` in expression";
    const result = buildRetryMessage("s('bd')", error);
    expect(result).toContain(error);
  });

  it("preserves triple backticks inside the code", () => {
    const code = "s('bd').```weird```";
    const result = buildRetryMessage(code, "parse error");
    expect(result).toContain(code);
  });

  it("handles empty error and code strings", () => {
    const result = buildRetryMessage("", "");
    expect(result).toContain("```\n\n```");
    expect(result).toContain("```strudel\n\n```");
    expect(result).toContain("Please fix the code.");
  });
});
