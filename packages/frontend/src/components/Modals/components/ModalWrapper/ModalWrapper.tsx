import * as React from "react";
import clsx from "clsx";
import { mergeRefs } from "react-merge-refs";
import { TransitionChildren } from "react-transition-group/Transition";
import FocusLock from "react-focus-lock";
import { useModalContext } from "../../helpers/ModalContext.ts";
import { ModalStackOptions } from "../../interfaces/modals.ts";
import styles from "./ModalWrapper.module.scss";

const getActiveClassName = (active: boolean) => active ? "entered" : "exited";
const isBackdropDisabled = (options: ModalStackOptions): boolean => options.closeOnBackdropClick === false;
const r = <R, >(ref: React.RefObject<R>): R => ref.current as R;
const isClickOnElement = (e: React.MouseEvent<HTMLDivElement>, wrapperRef: React.RefObject<HTMLDivElement | undefined>) => {
  const el = r(wrapperRef);
  return e.target === el &&
    e.clientX < el.clientWidth; // клик по скроллбару
};

type Props = {
  children: TransitionChildren
};

const ModalWrapper = React.forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { active, reject, options, onClosed } = useModalContext();
  const { children } = props;

  const wrapperRef = React.useRef<HTMLDivElement>();
  const somethingClosedWhileMouseDownRef = React.useRef(false);
  const mouseDownRef = React.useRef(false);

  const [backdropActive, setBackdropActive] = React.useState(false);
  const [contentActive, setContentActive] = React.useState(false);
  const timersRefs = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  React.useEffect(() => {
    if (active) {
      const timers = r(timersRefs);
      timers.backdrop = setTimeout(() => setBackdropActive(true), 0);
      timers.content = setTimeout(() => setContentActive(true), 150);
    } else {
      setBackdropActive(false);
      setContentActive(false);
      setTimeout(onClosed, 200);
    }
    return () => {
      const timers = r(timersRefs);
      if (timers.backdrop) clearTimeout(timers.backdrop);
      if (timers.content) clearTimeout(timers.content);
    };
  }, [active]);

  const onPointerDownWrapper = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isBackdropDisabled(options)) return;
    if (isClickOnElement(e, wrapperRef)) {
      mouseDownRef.current = true;
      somethingClosedWhileMouseDownRef.current = false;
    }
  };

  const onPointerUpWrapper = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isBackdropDisabled(options)) return;
    if (
      r(mouseDownRef) &&
      isClickOnElement(e, wrapperRef) &&
      !r(somethingClosedWhileMouseDownRef)
    ) {
      reject();
    }
  };

  return (
    <FocusLock autoFocus={false} {...options.focusLockProps}>
      <div className={styles.container} tabIndex={-1}>
        <div
          className={clsx(styles.backdrop, backdropActive && styles.backdropActive)}
          tabIndex={-1}
          onPointerDown={onPointerDownWrapper}
          onPointerUp={onPointerUpWrapper}
        />
        {Boolean(children) && (
          <React.Suspense fallback={<div />}>
            <div
              ref={mergeRefs([wrapperRef, ref])}
              className={clsx(styles.wrapper, getActiveClassName(contentActive))}
              onPointerDown={onPointerDownWrapper}
              onPointerUp={onPointerUpWrapper}
            >
              {typeof children === "function" ? children(getActiveClassName(contentActive)) : children}
            </div>
          </React.Suspense>
        )}
      </div>
    </FocusLock>
  );
});

export default React.memo(ModalWrapper);

