import { useEffect } from "react";

interface KeyboardShortcutsOptions {
  onStop: () => void;
  onAbort: () => void;
  isStreaming: boolean;
}

export function useKeyboardShortcuts({
  onStop,
  onAbort,
  isStreaming,
}: KeyboardShortcutsOptions) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === ".") {
        e.preventDefault();
        onStop();
      }
      if (e.key === "Escape" && isStreaming) {
        e.preventDefault();
        onAbort();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onStop, onAbort, isStreaming]);
}
