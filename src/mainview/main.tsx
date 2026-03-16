import "./rpc"; // Initialize Electrobun RPC before React renders
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./app.css";

createRoot(document.getElementById("root")!).render(<App />);
