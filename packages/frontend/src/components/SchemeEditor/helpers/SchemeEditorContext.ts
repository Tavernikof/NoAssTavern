import * as React from "react";
import { SchemeEditorState } from "./SchemeEditorState.ts";

export type SchemeEditorContextType = SchemeEditorState;

export const SchemeEditorContext = React.createContext<SchemeEditorContextType | null>(null);

export const useSchemeEditorContext = (): SchemeEditorContextType => {
  const context = React.useContext(SchemeEditorContext);
  if (!context) throw new Error("useSchemeEditorContext must be used within SchemeEditorContext");
  return context;
};
