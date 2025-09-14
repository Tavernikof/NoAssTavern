import * as React from "react";
import { FlowNode } from "src/enums/FlowNode.ts";
import FlowNodeLayout from "src/components/SchemeEditor/components/FlowNodeLayout/FlowNodeLayout.tsx";
import { FormInput, SelectControlled } from "src/components/Form";
import { DefaultFlowNodes } from "src/components/SchemeEditor";
import { useFlowEditorContext } from "src/components/FlowEditorModal/helpers/FlowEditorContext.ts";
import { observer } from "mobx-react-lite";
import { throwNodeError } from "src/helpers/throwNodeError.ts";

type FlowNodeSchemeState = {
  scheme: { value: string, label: string } | null,
}

export const flowNodeScheme: FlowNodeConfig<FlowNodeSchemeState> = {
  id: FlowNode.scheme,
  label: "Run Scheme",
  description: "Run target scheme",

  render: observer((props) => {
    const { extraBlocksOptions } = useFlowEditorContext();

    return (
      <FlowNodeLayout initialValue={props.data}>
        <FormInput label="Scheme">
          <SelectControlled
            name="scheme"
            options={extraBlocksOptions}
          />
        </FormInput>
        <DefaultFlowNodes />
      </FlowNodeLayout>
    );
  }),

  process(context) {
    const { flow, messageController, node } = context;
    const schemeId = node.data.scheme?.value;
    if (!schemeId) throwNodeError(messageController.message, "Prompt not selected");
    return flow.process(schemeId as string, messageController);
  },
};
