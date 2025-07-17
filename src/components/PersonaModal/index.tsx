import * as React from "react";
import { createModalOpener } from "src/components/Modals";

const opener = createModalOpener(React.lazy(() => import("./PersonaModal.tsx")));

export const openPersonaModal = (componentProps: Parameters<typeof opener>[0]["componentProps"]) => opener({
  title: "Persona edit",
  size: 1000,
  componentProps,
});