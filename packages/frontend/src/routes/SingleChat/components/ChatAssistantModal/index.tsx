import * as React from "react";
import { createModalOpener } from "src/components/Modals";

const opener = createModalOpener(React.lazy(() => import("./ChatAssistantModal.tsx")));

export const openChatAssistantModal = (
  componentProps: Parameters<typeof opener>[0]["componentProps"],
) => opener({
  title: "Assistant",
  componentProps,
  size: 1200,
  fullHeight: true,
}, { name: "chat-assistant" });
