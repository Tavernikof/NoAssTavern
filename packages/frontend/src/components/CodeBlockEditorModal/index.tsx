import * as React from "react";
import { createModalOpener } from "src/components/Modals";

const opener = createModalOpener(React.lazy(() => import("./CodeBlockEditorModal")));

export const openCodeBlockEditorModal = (componentProps: Parameters<typeof opener>[0]["componentProps"]) => opener({
  title: "Code block editor",
  size: 1000,
  fullHeight: true,
  componentProps,
});