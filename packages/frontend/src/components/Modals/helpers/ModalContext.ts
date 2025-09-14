import * as React from "react";
import { ModalStackItem } from "../interfaces/modals.ts";

const ModalContext = React.createContext<ModalStackItem | undefined>(undefined);
export default ModalContext;

export function useModalContext<P extends object>() {
  const context = React.useContext<ModalStackItem<P>>(
    (ModalContext as unknown) as React.Context<ModalStackItem<P>>,
  );
  if (!context) throw new Error("useModalContext must be used under Modal");
  return context;
}
