import { FlowNode } from "src/enums/FlowNode.ts";
import { FlowStartNode } from "src/components/SchemeEditor";

export const flowNodeStart: FlowNodeConfig = {
  id: FlowNode.start,
  label: "",
  description: "",
  render: FlowStartNode,
  process() {
  },
};
