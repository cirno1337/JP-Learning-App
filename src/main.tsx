import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/theme.css";
import { App } from "./App.tsx";
import { ProgressProvider } from "./features/progress/ProgressContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ProgressProvider>
      <App />
    </ProgressProvider>
  </StrictMode>,
);
