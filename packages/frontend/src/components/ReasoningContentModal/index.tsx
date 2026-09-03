import * as React from "react";
import { createModalOpener } from "src/components/Modals";

const opener = createModalOpener(React.lazy(() => import("./ReasoningContentModal")));

export const openReasoningContentModal = (componentProps: Parameters<typeof opener>[0]["componentProps"]) => opener({
  title: "Reasoning",
  size: "lg",
  componentProps,
});