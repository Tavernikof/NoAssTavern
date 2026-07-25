import * as React from "react";
import { createModalOpener } from "src/components/Modals";

const opener = createModalOpener(React.lazy(() => import("./GenerationPresetNameModal.tsx")));

export const openGenerationPresetNameModal = (componentProps: Parameters<typeof opener>[0]["componentProps"]) => opener({
  title: "Generation preset",
  size: "sm",
  componentProps,
});
