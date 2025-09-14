import * as React from "react";
import { createModalOpener } from "src/components/Modals";

const opener = createModalOpener(React.lazy(() => import("./FlowEditorModal.tsx")));

export const openFlowEditorModal = (componentProps: Parameters<typeof opener>[0]["componentProps"]) => opener({
  title: "Flow editor",
  size: 1600,
  // fullHeight: true,
  componentProps,
});