import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if (import.meta.env.DEV) {
  void import("./components/_internal/NexenInspector").then(({ NexenInspector }) => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    createRoot(host).render(<NexenInspector />);
  });
}
