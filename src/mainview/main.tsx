import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./app.css";

// Initialize Electrobun RPC (must happen before React renders)
import "./rpc";

createRoot(document.getElementById("root")!).render(<App />);
