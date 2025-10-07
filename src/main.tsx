// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
// เปลี่ยนมาใช้ HashRouter
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./index.css"; // ถ้ามี global styles/Tailwind

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
