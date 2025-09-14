import * as React from "react";

export type PopoverContextType = {
  activate: () => void,
  deactivate: () => void,
};

export const PopoverContext = React.createContext<PopoverContextType | null>(null);

export const usePopoverContext = (): PopoverContextType => {
  const context = React.useContext(PopoverContext);
  if (!context) throw new Error("usePopoverContext must be used within PopoverContext");
  return context;
};
