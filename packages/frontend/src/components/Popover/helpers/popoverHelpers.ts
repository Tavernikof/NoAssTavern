import { createPopoverBackend } from "./createPopoverBackend.ts";
import * as React from "react";
import { UseFloatingReturn, UseInteractionsReturn } from "@floating-ui/react";

export type PopoverApi = {
  activate: () => any,
  deactivate: (event?: MouseEvent) => any,
}

export type DropdownChildrenRenderProps = {
  onActivate: (e?: React.SyntheticEvent) => any,
  onDeactivate: () => any,
  elementRef: (node: Element | null) => void,
  active: boolean,
  getReferenceProps: UseInteractionsReturn["getReferenceProps"]
};

export type PopoverBackend = (isOpen: ReactUseState<boolean>, arrowRef: React.RefObject<HTMLDivElement>) => {
  floating: UseFloatingReturn,
  interactions: UseInteractionsReturn,
};

// ============================================================================

export const useDefaultBackend = createPopoverBackend();

// Чтобы клики внутри дропдауна не всплывали наверх
export const preventProps: React.HTMLProps<HTMLElement> = {
  onClick: (event) => {
    event.stopPropagation();
  },
};
