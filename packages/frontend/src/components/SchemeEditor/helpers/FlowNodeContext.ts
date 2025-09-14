import * as React from "react";

export type FlowNodeContextType = FlowNodeConfig;

export const FlowNodeContext = React.createContext<FlowNodeContextType | null>(null);

export const useFlowNodeContext = (): FlowNodeContextType | null => {
  return React.useContext(FlowNodeContext);
};
