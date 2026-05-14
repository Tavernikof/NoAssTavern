import * as React from "react";
import { PromptEditorController } from "src/components/PromptEditorModal/helpers/PromptEditorController.ts";

export type PromptEditorControllerContextType = PromptEditorController;

export const PromptEditorControllerContext = React.createContext<PromptEditorControllerContextType | null>(null);

export const usePromptEditorControllerContext = (): PromptEditorControllerContextType => {
  const context = React.useContext(PromptEditorControllerContext);
  if (!context) throw new Error("usePromptEditorControllerContext must be used within PresetEditorControllerContext");
  return context;
};
