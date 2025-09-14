import * as React from "react";
import { createModalOpener } from "src/components/Modals";

const opener = createModalOpener(React.lazy(() => import("./CharacterModal.tsx")));

export const openCharacterModal = (componentProps: Parameters<typeof opener>[0]["componentProps"]) => opener({
  title: "Character edit",
  size: 1000,
  componentProps,
});