import * as React from "react";
import { createModalOpener } from "src/components/Modals";

const opener = createModalOpener(React.lazy(() => import("./ChatFormModal.tsx")));

export const openChatFormModal = (componentProps: Parameters<typeof opener>[0]["componentProps"]) => opener({
  title: "Edit chat",
  size: 800,
  componentProps,
});