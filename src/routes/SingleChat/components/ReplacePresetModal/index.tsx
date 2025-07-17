import * as React from "react";
import { createModalOpener } from "src/components/Modals";

const opener = createModalOpener(React.lazy(() => import("./ReplacePresetModal")));

export const openReplacePresetModal = (componentProps: Parameters<typeof opener>[0]["componentProps"]) => opener({
  title: "Replace Preset",
  componentProps,
});