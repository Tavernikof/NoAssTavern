import * as React from "react";
import { createModalOpener } from "src/components/Modals";

const opener = createModalOpener(React.lazy(() => import("./ConnectionProxyModal.tsx")));

export const openConnectionProxyModal = (componentProps: Parameters<typeof opener>[0]["componentProps"]) => opener({
  title: "Connection proxy",
  componentProps,
});