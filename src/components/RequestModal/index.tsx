import * as React from "react";
import { createModalOpener } from "src/components/Modals";

const opener = createModalOpener(React.lazy(() => import("./RequestModal.tsx")));

export const openRequestModal = (componentProps: Parameters<typeof opener>[0]["componentProps"]) => opener({
  title: "Request",
  size: 800,
  componentProps,
});