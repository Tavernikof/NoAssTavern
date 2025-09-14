import * as React from "react";
import { useLatest } from "react-use";

const downEvents = window.PointerEvent
  ? ["pointerdown"] as const
  : ["mousedown", "touchstart"] as const;

const upEvents = window.PointerEvent
  ? ["pointerup"] as const
  : ["mouseup", "touchend"] as const;

export type UseClickOutsideConfig = {
  ignoreClass?: string;
  popoverBehavor?: boolean;
};

export const useClickOutside = (
  elementRef: React.RefObject<HTMLElement>,
  onClickOutside: (event: MouseEvent | TouchEvent | PointerEvent) => any,
  config?: UseClickOutsideConfig,
) => {
  const ignoreClass = config?.ignoreClass;
  const onClickOutsideRef = useLatest(onClickOutside);

  React.useEffect(() => {
    let lastEvent: MouseEvent | TouchEvent | PointerEvent | null = null;

    const onDown = (event: MouseEvent | TouchEvent | PointerEvent) => {
      lastEvent = null;
      const { target } = event;
      if (!(target instanceof HTMLElement) && !(target instanceof SVGElement)) return;
      const element = elementRef.current;
      if (!element) return;

      let el: HTMLElement | SVGElement | null = target;
      do {
        if (ignoreClass && el.classList.contains(ignoreClass)) return;
        if (el === element) return;
        if (config?.popoverBehavor && element.parentElement?.contains(el)) return;
        el = el.parentElement;
      } while (el);
      lastEvent = event;
      onClickOutsideRef.current(event);
    };
    const onUp = (event: MouseEvent | TouchEvent | PointerEvent) => {
      if (lastEvent && lastEvent.defaultPrevented) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    downEvents.forEach((eventName) => document.addEventListener(eventName, onDown));
    upEvents.forEach((eventName) => document.addEventListener(eventName, onUp));
    document.addEventListener("click", onUp, { capture: true });

    return () => {
      downEvents.forEach((eventName) => document.removeEventListener(eventName, onDown));
      upEvents.forEach((eventName) => document.removeEventListener(eventName, onUp));
      document.removeEventListener("click", onUp, { capture: true });
    };
  }, [elementRef, ignoreClass]);
};