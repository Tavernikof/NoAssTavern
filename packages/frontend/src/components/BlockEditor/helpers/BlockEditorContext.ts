import * as React from "react";
import { PresetEditor } from "./PresetEditor.ts";

export type BlockEditorContextType = PresetEditor;

export const BlockEditorContext = React.createContext<BlockEditorContextType | null>(null);

export const useBlockEditorContext = (): BlockEditorContextType => {
  const context = React.useContext(BlockEditorContext);
  if (!context) throw new Error("useBlockEditorContext must be used within BlockEditorContext");
  return context;
};
