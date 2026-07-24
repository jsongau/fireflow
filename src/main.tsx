import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@/styles/tokens.css";
import "@/styles/base.css";
import { App } from "@/app/App";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

const routerBasename =
  import.meta.env.BASE_URL === "/" ? "/" : import.meta.env.BASE_URL.slice(0, -1);

createRoot(rootEl).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
