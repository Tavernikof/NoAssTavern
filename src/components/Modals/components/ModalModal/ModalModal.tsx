import clsx from "clsx";
import * as React from "react";
import Transition, { TransitionStatus } from "react-transition-group/Transition";
// import Loader from "src/components/Loader";
import { X } from "lucide-react";
import ModalWrapper from "../ModalWrapper";
import { useModalContext } from "../../helpers/ModalContext";
import { ComponentProps } from "../../interfaces/modals";
import style from "./ModalModal.module.scss";

const transitionTimeout = { enter: 0, exit: 150 };

const sizesMap = {
  sm: 320,
  md: 520,
  lg: 768,
};

const getWidth = (size: Props["size"]): number => {
  if (typeof size === "number") return size;
  return sizesMap[size as keyof typeof sizesMap] || sizesMap.md;
};

const renderFallback = <div className={style.loading} />;
// const renderFallback = <div className={style.loading}><Loader /></div>;

export type Props<CP extends object = object> = {
  size?: keyof typeof sizesMap | number,
  title?: React.ReactNode,
  overflowHeight?: boolean,
  fullHeight?: boolean,
  component: React.ComponentType<CP>,
  // componentProps?: CP,
} & ComponentProps<CP>

const ModalModal: React.FC<Record<string, never>> = () => {
  const { active, reject, options, props } = useModalContext<Props>();
  const { size, title, overflowHeight, fullHeight, component, componentProps } = props;
  const containerRef = React.useRef<HTMLDivElement>(null);

  const showClose = !options?.hideClose;

  return (
    <ModalWrapper>
      <Transition nodeRef={containerRef} in={active} timeout={transitionTimeout} appear>
        {(state: TransitionStatus) => {
          const maxWidth = getWidth(size);
          const containerClassName = clsx(
            style.container,
            overflowHeight && style.containerOverflow,
            fullHeight && style.containerFullHeight,
          );
          return (
            <div ref={containerRef} className={containerClassName} style={{ maxWidth }}>
              <div className={clsx(style.content, state === "entered" && style.contentActive)}>
                {(Boolean(title) || showClose) && (
                  <div className={style.header}>
                    <div className={style.title} data-testid="modal-title">{title}</div>
                    {showClose && (
                      <button className={style.close} onClick={reject} tabIndex={-1}>
                        <X />
                      </button>
                    )}
                  </div>
                )}
                <div className={style.body}>
                  <React.Suspense fallback={renderFallback}>
                    {React.createElement(component, componentProps)}
                  </React.Suspense>
                </div>
              </div>
            </div>
          );
        }}
      </Transition>
    </ModalWrapper>
  );
};

export default React.memo(ModalModal);
