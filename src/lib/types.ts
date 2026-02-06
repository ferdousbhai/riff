export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  pattern?: string; // extracted Strudel code, if any
}

export type PlaybackState = "stopped" | "playing" | "loading" | "error";

export interface EvalResult {
  ok: boolean;
  error?: string;
}
