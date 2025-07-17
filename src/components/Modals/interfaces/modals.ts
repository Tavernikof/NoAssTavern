import * as React from "react";
import FocusLock from "react-focus-lock";

export type ModalStackOptions = {
  name?: string,
  closeOnEsc?: boolean,
  closeOnBackdropClick?: boolean,
  focusLockProps?: React.ComponentProps<typeof FocusLock>,
  afterClose?: () => any,
  hideClose?: boolean,
};

export type ModalStackComponent =
  | React.LazyExoticComponent<React.ComponentType<Record<string, never>>>
  | React.ComponentType<Record<string, never>>;

export type ModalStackItem<Props extends object = object> = {
  // Поля для внутреннего использования
  component: ModalStackComponent,
  index: number,
  active: boolean,
  onClosed: () => void,

  // Успешно закрывает модалку и возвращает наружу data
  resolve: (data?: any) => any,
  // закрывает модалку с ошибкой и возвращает наружу reason
  reject: (reason?: any) => any,
  // Регистрирует колбек, который вызовется перед закрытием модалки
  onBeforeClose?: (fn: () => any) => void,

  result: Promise<any>,
  props: Props,
  options: ModalStackOptions,
};

export type ModalContainerApiOpen<Props extends object = object> = (
  component: ModalStackComponent,
  props: Props,
  options?: ModalStackOptions,
) => ModalStackItem<Props>;

export type ModalContainerApi = {
  open: ModalContainerApiOpen,
  closeAll: () => void,
}

type HasRequiredKeys<T> = object extends T ? false : true;

export type ComponentProps<P extends object> = (HasRequiredKeys<P> extends true
  ? { componentProps: P }
  : { componentProps?: P }
  );