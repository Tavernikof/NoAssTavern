import { action, makeObservable, observable } from "mobx";
import { Edge, Node } from "@xyflow/react";

export enum ContextMenuType {
  canvas,
  node,
  edge,
}

type ContextMenuPosition =
  | { top: number, left: number, type: ContextMenuType.canvas }
  | { top: number, left: number, type: ContextMenuType.node, node: Node }
  | { top: number, left: number, type: ContextMenuType.edge, edge: Edge };

export class SchemeEditorState {
  @observable.ref contextMenuPosition: ContextMenuPosition | null = null;

  constructor() {
    makeObservable(this);
  }

  @action.bound
  setContextMenuPosition(contextMenuPosition: ContextMenuPosition | null) {
    this.contextMenuPosition = contextMenuPosition;
  }
}