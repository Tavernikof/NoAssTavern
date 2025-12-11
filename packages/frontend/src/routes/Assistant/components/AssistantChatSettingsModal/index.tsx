import * as React from "react";
import { createModalOpener } from "src/components/Modals";

const opener = createModalOpener(React.lazy(() => import("./AssistantChatSettingsModal")));

export const openAssistantChatSettingsModal = (componentProps: Parameters<typeof opener>[0]["componentProps"]) => opener({
  title: "Assistant settings",
  componentProps,
});