import * as React from "react";
import { PresetEditorController } from "src/components/CodeEditor/helpers/PresetEditorController.ts";

export type PresetEditorControllerContextType = PresetEditorController;

export const PresetEditorControllerContext = React.createContext<PresetEditorControllerContextType | null>(null);

export const usePresetEditorControllerContext = (): PresetEditorControllerContextType => {
  const context = React.useContext(PresetEditorControllerContext);
  if (!context) throw new Error("useCodeEditorControllerContext must be used within CodeEditorContext");
  return context;
};
