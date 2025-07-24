import {
  arrow,
  autoUpdate,
  flip,
  offset,
  Placement,
  shift,
  useClick,
  useDismiss,
  useFloating, useHover,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { PopoverBackend } from "./popoverHelpers";
import { OffsetOptions } from "@floating-ui/dom";

export type UsePopoverBackendProps = {
  placement?: Placement,
  hover?: boolean,
  toggle?: boolean,
  offset?: OffsetOptions,
}

// Стандартный поповер. Открывается при клике, закрывается при клике мимо
export const createPopoverBackend = (props?: UsePopoverBackendProps): PopoverBackend => {
  const placement = props?.placement || "bottom-start";
  const toggle = props?.toggle ?? true;
  const offsetOptions = props?.offset ?? 6;
  const hover = props?.hover ?? false;

  return (isOpenState, arrowRef) => {
    const [isOpen, setIsOpen] = isOpenState;

    const floating = useFloating({
      open: isOpen,
      onOpenChange: setIsOpen,
      placement,
      whileElementsMounted: autoUpdate,
      middleware: [
        offset(offsetOptions),
        flip({ crossAxis: false }),
        shift({ padding: 6 }),
        arrow({ padding: 6, element: arrowRef }),
      ],
    });
    const { context } = floating;

    const interactions = useInteractions([
      hover
        ? useHover(context)
        : useClick(context, { toggle }),
      useDismiss(context),
      useRole(context, { role: "tooltip" }),
    ]);

    return { floating, interactions };
  };
};