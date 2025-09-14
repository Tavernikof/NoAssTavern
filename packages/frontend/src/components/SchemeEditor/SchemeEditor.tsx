import * as React from "react";
import {
  addEdge,
  Background,
  BackgroundVariant, Connection,
  Controls,
  Edge,
  Node,
  ReactFlow,
  reconnectEdge,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { SchemeEditorContext } from "./helpers/SchemeEditorContext.ts";
import { ContextMenuType, SchemeEditorState } from "./helpers/SchemeEditorState.ts";
import SchemeEditorContextMenu from "./components/SchemeEditorContextMenu";
import { nodeTypes } from "src/helpers/flowNodes";
import { FlowSchemeState } from "src/storages/FlowsStorage.ts";
import _throttle from "lodash/throttle";
import { useLatest } from "react-use";
import { FlowNode } from "src/enums/FlowNode.ts";
// import style from "./SchemeEditor.module.scss";

type Props = {
  id: string;
  initialState: FlowSchemeState;
  onChange: (nodes: Node[], edges: Edge[]) => void;
};

const SchemeEditor: React.FC<Props> = (props) => {
  const propsRef = useLatest(props);
  const { id, initialState } = props;
  const editorRef = React.useRef<HTMLDivElement>(null);

  const state = React.useMemo(() => new SchemeEditorState(), []);

  const edgeReconnectSuccessful = React.useRef(true);
  const [nodes, , onNodesChange] = useNodesState(initialState.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialState.edges);

  const onChangeLocal = React.useMemo(() => {
    return _throttle((nodes, edges) => propsRef.current.onChange(nodes, edges), 500);
  }, []);

  React.useEffect(() => {
    onChangeLocal(nodes, edges);
  }, [nodes, edges]);

  return (
    <SchemeEditorContext.Provider value={state}>
      <ReactFlow
        ref={editorRef}
        id={id}
        colorMode="dark"
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}

        onNodesChange={onNodesChange}

        onEdgesChange={onEdgesChange}

        onBeforeDelete={(props) => {
          if (props.nodes.some(node => node.type === FlowNode.start)) return Promise.resolve(false);
          return Promise.resolve(true);
        }}

        // ====================================================================

        onConnect={React.useCallback((connection: Connection) => {
          setEdges((eds) => addEdge(connection, eds));
        }, [setEdges])}

        onReconnect={React.useCallback((oldEdge: Edge, newConnection: Connection) => {
          edgeReconnectSuccessful.current = true;
          setEdges((els) => {
            if (els.find(edge => edge.source === newConnection.source && edge.target === newConnection.target && edge.id !== oldEdge.id)) {
              return els.filter(edge => edge.id !== oldEdge.id);
            }
            return reconnectEdge(oldEdge, newConnection, els);
          });
        }, [setEdges])}

        onReconnectStart={React.useCallback(() => {
          edgeReconnectSuccessful.current = false;
        }, [])}

        onReconnectEnd={React.useCallback((_: MouseEvent | TouchEvent, edge: Edge) => {
          if (!edgeReconnectSuccessful.current) {
            setEdges((eds) => eds.filter((e) => e.id !== edge.id));
          }

          edgeReconnectSuccessful.current = true;
        }, [setEdges])}

        // ====================================================================

        onContextMenu={React.useCallback((event: React.MouseEvent) => {
          event.preventDefault();
          event.stopPropagation();
          state.setContextMenuPosition({ top: event.clientY, left: event.clientX, type: ContextMenuType.canvas });
          return;
        }, [state])}

        onNodeContextMenu={React.useCallback((event: React.MouseEvent, node: Node) => {
          event.preventDefault();
          event.stopPropagation();
          state.setContextMenuPosition({ top: event.clientY, left: event.clientX, type: ContextMenuType.node, node });
          return;
        }, [state])}

        onEdgeContextMenu={React.useCallback((event: React.MouseEvent, edge: Edge) => {
          event.preventDefault();
          event.stopPropagation();
          state.setContextMenuPosition({ top: event.clientY, left: event.clientX, type: ContextMenuType.edge, edge });
          return;
        }, [state])}
      >
        <Background variant={BackgroundVariant.Dots} />
        <Controls />
        <SchemeEditorContextMenu />
      </ReactFlow>
    </SchemeEditorContext.Provider>
  );
};

export default React.memo(SchemeEditor) as typeof SchemeEditor;
