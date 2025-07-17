import * as React from "react";
import { FlowEditorState } from "./FlowEditorState.ts";

export type FlowEditorContextType = FlowEditorState;

export const FlowEditorContext = React.createContext<FlowEditorContextType | null>(null);

export const useFlowEditorContext = (): FlowEditorContextType => {
  const context = React.useContext(FlowEditorContext);
  if (!context) throw new Error("useFlowEditorContext must be used within FlowEditorContext");
  return context;
};
