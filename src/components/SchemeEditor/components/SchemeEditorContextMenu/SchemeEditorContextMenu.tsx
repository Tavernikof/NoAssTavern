import * as React from "react";
import * as ReactDOM from "react-dom";
import style from "./SchemeEditorContextMenu.module.scss";
import { useSchemeEditorContext } from "../../helpers/SchemeEditorContext.ts";
import { observer } from "mobx-react-lite";
import { useClickOutside } from "src/helpers/useClickOutside.ts";
import ContextMenu, { ContextMenuOption } from "src/components/ContextMenu";
import { flowNodes } from "src/helpers/flowNodes";
import { Position, ReactFlowInstance, useReactFlow } from "@xyflow/react";
import randomString from "src/helpers/randomString.ts";
import { ContextMenuType, SchemeEditorState } from "src/components/SchemeEditor/helpers/SchemeEditorState.ts";
import { FlowNode } from "src/enums/FlowNode.ts";

const contextMenuProcessor: Record<ContextMenuType, {
  title: string,
  getOptions: (flow: ReactFlowInstance, schemeEditorState: SchemeEditorState) => ContextMenuOption[]
}> = {
  [ContextMenuType.canvas]: {
    title: "Add node",
    getOptions: (flow, schemeEditorState) => {
      const { setContextMenuPosition, contextMenuPosition } = schemeEditorState;
      if (!contextMenuPosition) return [];
      return flowNodes.map(flowNode => ({
        id: flowNode.id,
        label: flowNode.label,
        description: flowNode.description,
        onClick: () => {
          flow.addNodes({
            id: randomString(10),
            type: flowNode.id,
            position: flow.screenToFlowPosition({ x: contextMenuPosition.left, y: contextMenuPosition.top }),
            data: {},
            sourcePosition: Position.Right,
            targetPosition: Position.Left,

          });
          setContextMenuPosition(null);
        },
      })).filter(n => n.label);
    },
  },
  [ContextMenuType.node]: {
    title: "Node options",
    getOptions: (flow, schemeEditorState) => {
      const { setContextMenuPosition, contextMenuPosition } = schemeEditorState;
      if (!contextMenuPosition || contextMenuPosition.type !== ContextMenuType.node) return [];
      if (contextMenuPosition.node.type === FlowNode.start) return [];
      const id = contextMenuPosition.node.id;
      return [{
        id: "delete",
        label: "Delete node",
        onClick: () => {
          flow.setNodes((nodes) => nodes.filter((node) => node.id !== id));
          flow.setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
          setContextMenuPosition(null);
        },
      }];
    },
  },
  [ContextMenuType.edge]: {
    title: "Edge options",
    getOptions: (flow, schemeEditorState) => {
      const { setContextMenuPosition, contextMenuPosition } = schemeEditorState;
      if (!contextMenuPosition || contextMenuPosition.type !== ContextMenuType.edge) return [];
      const id = contextMenuPosition.edge.id;
      return [{
        id: "delete",
        label: "Delete edge",
        onClick: () => {
          flow.setEdges((edges) => edges.filter((edge) => edge.id !== id));
          setContextMenuPosition(null);
        },
      }];
    },
  },
};

type Props = Record<string, never>;

const SchemeEditorContextMenu: React.FC<Props> = () => {
  const schemeEditorState = useSchemeEditorContext();
  const flow = useReactFlow();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { contextMenuPosition, setContextMenuPosition } = schemeEditorState;

  useClickOutside(
    containerRef,
    () => {
      setContextMenuPosition(null);
    },
  );

  if (!contextMenuPosition) return null;
  const { top, left, type } = contextMenuPosition;

  const { title, getOptions } = contextMenuProcessor[type];
  const options = getOptions(flow, schemeEditorState);
  if (!options.length) return null;

  return ReactDOM.createPortal(
    <div
      ref={containerRef}
      className={style.container}
      style={{ "--context-menu-left": left, "--context-menu-top": top } as React.CSSProperties}
    >
      <ContextMenu
        title={title}
        options={options}
      />
    </div>,
    document.body,
  );
};

export default observer(SchemeEditorContextMenu) as typeof SchemeEditorContextMenu;
