import * as React from "react";
import { PresetEditor } from "./PresetEditor";

export type CodeEditorContextType = PresetEditor;

export const CodeEditorContext = React.createContext<CodeEditorContextType | null>(null);

export const useCodeEditorContext = (): CodeEditorContextType => {
  const context = React.useContext(CodeEditorContext);
  if (!context) throw new Error("useCodeEditorContext must be used within CodeEditorContext");
  return context;
};
