import * as React from "react";
import style from "./FlowStartNode.module.scss";
import { Handle, NodeProps, Position } from "@xyflow/react";

type Props = NodeProps;

const FlowStartNode: React.FC<Props> = () => {
  return (
    <>
      <div className={style.container}>
        START
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
};

export default React.memo(FlowStartNode) as typeof FlowStartNode;
