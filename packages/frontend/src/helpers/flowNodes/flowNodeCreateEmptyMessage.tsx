import * as React from "react";
import { FlowNode } from "src/enums/FlowNode.ts";
import { ChatMessageRole } from "src/enums/ChatManagerRole.ts";
import FlowNodeLayout from "src/components/SchemeEditor/components/FlowNodeLayout/FlowNodeLayout.tsx";
import { FormInput, SelectControlled } from "src/components/Form";
import { DefaultFlowNodes } from "src/components/SchemeEditor";
import { throwNodeError } from "src/helpers/throwNodeError.ts";

type FlowNodeEreateEmptyMessageState = {
  role: { value: string, label: string } | null,
}

export const flowNodeCreateEmptyMessage: FlowNodeConfig<FlowNodeEreateEmptyMessageState> = {
  id: FlowNode.createEmptyMessage,
  label: "Create message",
  description: "Create empty message",

  render: React.memo((props) => {
    return (
      <FlowNodeLayout initialValue={props.data}>
        <FormInput label="Role">
          <SelectControlled
            name="role"
            options={[
              {
                value: ChatMessageRole.ASSISTANT,
                label: "Assistant",
              },
              {
                value: ChatMessageRole.USER,
                label: "User",
              },
            ]}
          />
        </FormInput>
        <DefaultFlowNodes />
      </FlowNodeLayout>
    );
  }),

  process(context) {
    const { node, messageController: { chatController, message } } = context;
    const role = node.data.role?.value as ChatMessageRole;
    if (!role) throwNodeError(message, "Role not found");

    context.messageController = role === ChatMessageRole.ASSISTANT
      ? chatController.createMessage({ role })
      : chatController.createEmptyUserMessage();
  },
};
