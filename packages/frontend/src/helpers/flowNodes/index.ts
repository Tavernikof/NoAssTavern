import * as React from "react";
import { FlowNode } from "src/enums/FlowNode.ts";
import type { NodeProps, NodeTypes } from "@xyflow/react";
import FlowNodeWrapper from "src/components/SchemeEditor/components/FlowNodeWrapper";
import { flowNodeGenerate } from "src/helpers/flowNodes/flowNodeGenerate.tsx";
import { flowNodeTranslate } from "src/helpers/flowNodes/flowNodeTranslate.tsx";
import { flowNodeStart } from "src/helpers/flowNodes/flowNodeStart.tsx";
import { flowNodeCreateEmptyMessage } from "src/helpers/flowNodes/flowNodeCreateEmptyMessage.tsx";
import { flowNodeScheme } from "src/helpers/flowNodes/flowNodeScheme.tsx";

export const flowNodes: FlowNodeConfig<any>[] = [
  flowNodeStart,
  flowNodeGenerate,
  flowNodeScheme,
  flowNodeTranslate,
  flowNodeCreateEmptyMessage,
];

const dict: Record<string, FlowNodeConfig> = {};
flowNodes.forEach(flowNode => {
  dict[flowNode.id] = flowNode;
});

export const nodeTypes = flowNodes.reduce<NodeTypes>((dict, flowNode) => {
  if (flowNode.render) {
    dict[flowNode.id] = (nodeProps: NodeProps) => React.createElement(FlowNodeWrapper, {
      flowNode,
      nodeProps,
    });
  }
  return dict;
}, {});


export const flowNodesDict = dict as Record<FlowNode, FlowNodeConfig>;