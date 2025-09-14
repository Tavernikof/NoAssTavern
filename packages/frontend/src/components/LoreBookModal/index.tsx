import * as React from "react";
import { createModalOpener } from "src/components/Modals";

const opener = createModalOpener(React.lazy(() => import("./LoreBookModal.tsx")));

export const openLoreBookModal = (componentProps: Parameters<typeof opener>[0]["componentProps"]) => opener({
  title: "Lorebook edit",
  size: 1000,
  componentProps,
});