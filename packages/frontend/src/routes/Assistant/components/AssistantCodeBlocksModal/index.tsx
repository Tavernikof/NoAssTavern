import * as React from "react";
import { createModalOpener } from "src/components/Modals";

const opener = createModalOpener(React.lazy(() => import("./AssistantCodeBlocksModal")));

export const openAssistantCodeBlocksModal = (componentProps: Parameters<typeof opener>[0]["componentProps"]) => opener({
  title: "Assistant code blocks",
  size: 1600,
  fullHeight: true,
  componentProps,
});
