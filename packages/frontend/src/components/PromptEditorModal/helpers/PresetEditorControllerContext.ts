import * as React from "react";
import { PresetEditorController } from "src/components/PromptEditorModal/helpers/PresetEditorController.ts";

export type PresetEditorControllerContextType = PresetEditorController;

export const PresetEditorControllerContext = React.createContext<PresetEditorControllerContextType | null>(null);

export const usePresetEditorControllerContext = (): PresetEditorControllerContextType => {
  const context = React.useContext(PresetEditorControllerContext);
  if (!context) throw new Error("usePresetEditorControllerContext must be used within PresetEditorControllerContext");
  return context;
};
