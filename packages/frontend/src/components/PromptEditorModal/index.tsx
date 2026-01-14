import * as React from "react";
import { createModalOpener } from "src/components/Modals";

const opener = createModalOpener(React.lazy(() => import("./PromptEditorModal.tsx")));

export const openPromptEditorModal = (componentProps: Parameters<typeof opener>[0]["componentProps"]) => opener({
  title: "Prompt editor",
  size: 1200,
  fullHeight: true,
  componentProps,
});