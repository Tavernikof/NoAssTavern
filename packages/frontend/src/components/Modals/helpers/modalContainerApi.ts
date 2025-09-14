import * as React from "react";
import { ModalContainerApi, ModalContainerApiOpen } from "../interfaces/modals.ts";

let _instance: React.RefObject<ModalContainerApi | undefined> | undefined;

export const setModalContainer = (instance: React.RefObject<ModalContainerApi | undefined> | undefined) => {
  if (instance && _instance) console.warn("ModalStack уже существует");
  _instance = instance;
};

export const addModal: ModalContainerApiOpen = (component, props, options = {}) => {
  if (!_instance?.current) throw ("ModalStack не смонтирован");

  return _instance.current.open(component, props, options);
};

export const closeAllModals = () => {
  if (!_instance?.current) throw ("ModalStack не смонтирован");
  return _instance.current.closeAll();
};
