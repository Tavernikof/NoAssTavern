import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "destyle.css";
import "./styles/fonts.scss";
import "./styles/vars.scss";
import "./styles/app.scss";
import App from "./components/App";
import { createSeeds } from "src/helpers/seeds.ts";

createSeeds();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
