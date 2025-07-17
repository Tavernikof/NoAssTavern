import * as React from "react";
import type { NodeProps } from "@xyflow/react";
import { FlowNodeContext } from "src/components/SchemeEditor/helpers/FlowNodeContext.ts";

type Props = {
  flowNode: FlowNodeConfig,
  nodeProps: NodeProps
};

const FlowNodeWrapper: React.FC<Props> = (props) => {
  const { flowNode, nodeProps } = props;

  return (
    <FlowNodeContext.Provider value={flowNode}>
      {flowNode.render ? React.createElement(flowNode.render, nodeProps) : null}
    </FlowNodeContext.Provider>
  );

};

export default React.memo(FlowNodeWrapper) as typeof FlowNodeWrapper;
