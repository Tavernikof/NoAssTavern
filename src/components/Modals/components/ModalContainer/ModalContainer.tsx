import * as React from "react";
import ReactDOM from "react-dom";
import { useLatest } from "react-use";
import { setModalContainer } from "../../helpers/modalContainerApi";
import ModalContext from "../../helpers/ModalContext";
import { ModalContainerApi, ModalContainerApiOpen, ModalStackItem } from "../../interfaces/modals";
import * as overflowBody from "../../helpers/overflowBody";
import "./ModalContainer.module.scss";
import { isPromise } from "../../../../helpers/promisify.ts";
import { UNSAFE_LocationContext } from "react-router";

let nextIndex = 1;

type Props = {
  onOpen?: (item: ModalStackItem<any>) => void,
};

const ModalContainer: React.FC<Props> = (props) => {
  const { onOpen } = props;
  const [items, setItems] = React.useState<ModalStackItem[]>([]);
  const itemsRef = useLatest(items);

  const routerContext = React.useContext(UNSAFE_LocationContext);
  React.useEffect(() => {
    closeAll();
  }, [routerContext.location.pathname]);

  const open = React.useCallback<ModalContainerApiOpen>((component, props, options = {}) => {
    let resolve: (value: any) => any;
    let reject: (reason?: any) => any;
    let rejectPredicate: (() => any) | null = null;
    const result = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    const index = nextIndex++;

    const item: ModalStackItem = {
      component,
      index,
      active: true,
      resolve: (data: any) => resolve(data),
      reject: (data?: any) => {
        if (typeof rejectPredicate !== "function") return reject(data);
        try {
          const result = rejectPredicate();
          if (isPromise(result)) {
            return result.then((data: any) => {
              data ? resolve(data) : reject(data);
            }, () => ({}));
          } else {
            result ? resolve(result) : reject(result);
          }
        } catch (e) {
          console.log(e);
        }
      },
      onBeforeClose: (fn: typeof rejectPredicate) => rejectPredicate = fn,
      onClosed: () => {
        setItems((items) => items.filter(item => item.index !== index));
        item.options?.afterClose?.();
        overflowBody.deactivate(item.index);
      },
      result,
      props,
      options,
    };

    const name = options?.name;
    const items = itemsRef.current;
    if (name && items.find(item => item.options && item.options.name === name)) {
      requestAnimationFrame(() => reject());
      return item;
    }

    overflowBody.activate(item.index);

    const close = () => {
      // Если вкладка в бекграунде, requestAnimationFrame не сработает вовремя
      item.active = false;
      setItems((items) => items.map(i => i === item ? { ...item, active: false } : i));
    };
    result.then(close, close);

    requestAnimationFrame(() => {
      setItems((items) => item.active ? ([...items, item]) : items);
    });

    onOpen?.(item);

    return item;
  }, [onOpen]);

  const closeAll = React.useCallback(() => {
    itemsRef.current.forEach(item => {
      if (item.active) item.reject();
    });
  }, []);

  const api = React.useRef<ModalContainerApi>();
  api.current = { open, closeAll };

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const items = itemsRef.current;
      if (!items.length) return;

      if (e.keyCode === 27) { // ESC
        e.preventDefault();
        e.stopPropagation();
        const topItem = items[items.length - 1];
        if (topItem.options?.closeOnEsc === false) return;
        topItem.reject();
      }
    };

    setModalContainer(api);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      setModalContainer(undefined);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const renderModal = React.useCallback((config: ModalStackItem) => {
    const { component, index } = config;
    return (
      <ModalContext.Provider key={index} value={config}>
        <React.Suspense fallback={null}>
          {React.createElement(component)}
        </React.Suspense>
      </ModalContext.Provider>
    );
  }, []);

  return ReactDOM.createPortal(
    items.map(renderModal),
    document.getElementById("modals") as HTMLElement,
  );
};

export default React.memo(ModalContainer);
