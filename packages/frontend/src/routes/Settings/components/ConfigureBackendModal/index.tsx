import * as React from "react";
import { createModalOpener } from "src/components/Modals";

const opener = createModalOpener(React.lazy(() => import("./ConfigureBackendModal")));

export const openConfigureBackendModal = (componentProps: Parameters<typeof opener>[0]["componentProps"]) => opener({
  title: "Configure backend",
  size: 700,
  componentProps,
});