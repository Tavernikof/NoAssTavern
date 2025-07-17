import * as React from "react";
import { FloatingPortal, useTransitionStatus } from "@floating-ui/react";
import { throttle } from "lodash";
import { PopoverContext } from "./helpers/PopoverContext";
import style from "./Popover.module.scss";
import {
  DropdownChildrenRenderProps,
  PopoverApi,
  PopoverBackend,
  preventProps,
  useDefaultBackend,
} from "./helpers/popoverHelpers";
import clsx from "clsx";
import { useUpdateEffect } from "react-use";

export type Props = {
  children: (props: DropdownChildrenRenderProps) => React.ReactNode,
  renderDropdown: () => React.ReactNode,
  useBackend?: PopoverBackend,
  arrowClassName?: string,
  hideBackdrop?: boolean,
  onDeactivate?: () => void;
};

const Popover = React.forwardRef<PopoverApi, Props>((props, ref) => {
  const {
    children,
    renderDropdown,
    useBackend = useDefaultBackend,
    arrowClassName,
    hideBackdrop,
    onDeactivate,
  } = props;

  const isOpenState = React.useState(false);
  const [isOpen, setIsOpen] = isOpenState;
  const backdropRef = React.useRef<HTMLDivElement>(null);
  const arrowRef = React.useRef<HTMLDivElement>(null);

  useUpdateEffect(() => {
    if (onDeactivate && !isOpen) onDeactivate();
  }, [isOpen]);

  const { floating, interactions } = useBackend(isOpenState, arrowRef);
  const { refs, floatingStyles, context, placement, middlewareData } = floating;
  const { getReferenceProps, getFloatingProps } = interactions;

  const { isMounted, status } = useTransitionStatus(context, { duration: 150 });

  const popoverContext = React.useMemo(() => ({
    activate: () => setIsOpen(true),
    deactivate: () => setIsOpen(false),
  }), []);

  React.useImperativeHandle(ref, () => {
    return popoverContext;
  }, [popoverContext]);

  React.useEffect(() => {
    if (isOpen && !hideBackdrop) {
      const listener = throttle((event: MouseEvent) => {
        const container = refs.reference.current;
        const isOverContainer = container ? document.elementsFromPoint(event.clientX, event.clientY).some(el => el === container) : false;
        const backdrop = backdropRef.current;
        if (backdrop) backdrop.style.pointerEvents = isOverContainer ? "none" : "";
      }, 50, { trailing: true });
      document.addEventListener("mousemove", listener);
      requestAnimationFrame(() => {
        const backdrop = backdropRef.current;
        if (backdrop) backdrop.style.pointerEvents = "none";
      });
      return () => {
        document.removeEventListener("pointerdown", listener);
      };
    }
  }, [isOpen, hideBackdrop]);
  
  const { arrow } = middlewareData;
  const arrowX = arrow?.x;
  const arrowY = arrow?.y;

  return (
    <PopoverContext.Provider value={popoverContext}>
      {children({
        active: isOpen,
        onActivate: () => setIsOpen(!isOpen),
        onDeactivate: () => setIsOpen(!isOpen),
        elementRef: refs.setReference,
        getReferenceProps,
      })}
      {isMounted && (
        <>
          <FloatingPortal>
            {!hideBackdrop && isOpen && (
              <div ref={backdropRef} className={style.backdrop} style={{ pointerEvents: "none" }} />
            )}
            <div
              ref={refs.setFloating}
              className={style.dropdown}
              style={floatingStyles}
              {...getFloatingProps(preventProps)}
            >
              <div
                className={style.dropdownInner}
                data-status={status} // unmounted -> initial -> open -> close -> unmounted
                data-placement={placement}
                style={{
                  "--popover-arrow-x": arrowX ? arrowX + "px" : arrowX,
                  "--popover-arrow-y": arrowY ? arrowY + "px" : arrowY,
                } as React.CSSProperties}
              >
                <div ref={arrowRef} className={clsx(style.arrow, arrowClassName)} />
                {renderDropdown()}
              </div>
            </div>
          </FloatingPortal>
        </>
      )}
    </PopoverContext.Provider>
  );
});

export default React.memo(Popover);
