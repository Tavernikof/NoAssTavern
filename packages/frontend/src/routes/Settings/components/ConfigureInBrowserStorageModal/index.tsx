import * as React from "react";
import { createModalOpener } from "src/components/Modals";

const opener = createModalOpener(React.lazy(() => import("./ConfigureInBrowserStorageModal.tsx")));

export const openConfigureInBrowserStorageModal = (componentProps: Parameters<typeof opener>[0]["componentProps"]) => opener({
  title: "Configure in browser storage",
  size: 700,
  componentProps,
});