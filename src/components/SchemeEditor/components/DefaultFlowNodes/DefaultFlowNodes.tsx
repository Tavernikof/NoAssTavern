import * as React from "react";
import { Handle, Position } from "@xyflow/react";
// import style from "./DefaultFlowNodes.module.scss";

type Props = Record<string, never>;

const DefaultFlowNodes: React.FC<Props> = () => {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
      />
      <Handle
        type="source"
        position={Position.Right}
      />
    </>
  );
};

export default React.memo(DefaultFlowNodes) as typeof DefaultFlowNodes;
