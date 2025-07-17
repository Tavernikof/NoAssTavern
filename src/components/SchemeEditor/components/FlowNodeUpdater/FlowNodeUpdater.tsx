import * as React from "react";
import { useWatch } from "react-hook-form";
import { useNodeId, useReactFlow } from "@xyflow/react";

type Props = Record<string, never>;

const FlowNodeUpdater: React.FC<Props> = () => {
  const value = useWatch();
  const id = useNodeId();
  const { updateNodeData } = useReactFlow();

  React.useEffect(() => {
    if (id) updateNodeData(id, value);
  }, [id, value]);

  return null;
};

export default React.memo(FlowNodeUpdater) as typeof FlowNodeUpdater;
