import * as React from "react";
import { addModal } from "./modalContainerApi.ts";
import { ModalStackOptions } from "../interfaces/modals.ts";
import { Props as ModalProps } from "../components/ModalModal";

const Modal = React.lazy(() => import("../components/ModalModal"));

const mergeOptions = (options1: ModalStackOptions | undefined, options2: ModalStackOptions | undefined): ModalStackOptions | undefined => {
  return options1 && options2
    ? { ...options1, ...options2 }
    : options1 || options2;
};

export function createModalOpener<Props extends object>(
  component: ModalProps<Props>["component"],
  selfOptions?: ModalStackOptions,
) {
  return (
    props: Omit<ModalProps<Props>, "component">,
    options?: ModalStackOptions,
  ) => addModal(
    Modal,
    { ...props, component },
    mergeOptions(selfOptions, options),
  );
}
