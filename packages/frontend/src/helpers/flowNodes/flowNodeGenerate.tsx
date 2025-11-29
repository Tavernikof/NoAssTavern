import "react";
import { FlowNode } from "src/enums/FlowNode.ts";
import { requestStorage, RequestStorageItem } from "src/storages/RequestStorage.ts";
import { v4 as uuid } from "uuid";
import { action, runInAction } from "mobx";
import FlowNodeLayout from "src/components/SchemeEditor/components/FlowNodeLayout/FlowNodeLayout.tsx";
import { FormInput, SelectControlled } from "src/components/Form";
import { DefaultFlowNodes } from "src/components/SchemeEditor";
import { throwNodeError } from "src/helpers/throwNodeError.ts";
import { isDefaultScheme } from "src/enums/SchemeName.ts";
import { ChatSwipePrompt } from "src/enums/ChatSwipePrompt.ts";
import { useFlowEditorContext } from "src/components/FlowEditorModal/helpers/FlowEditorContext.ts";
import { Prompt } from "src/store/Prompt.ts";
import { sendRequestFromFlow } from "src/helpers/sendRequestFromFlow.ts";
import { observer } from "mobx-react-lite";

type FlowNodeGenerateState = {
  prompt: { value: string, label: string } | null,
}

export const flowNodeGenerate: FlowNodeConfig<FlowNodeGenerateState> = {
  id: FlowNode.generate,
  label: "Generate",
  description: "Generate content with given prompt",

  render: observer((props) => {
    const { promptsOptions } = useFlowEditorContext();
    return (
      <FlowNodeLayout initialValue={props.data}>
        <FormInput label="Prompt">
          <SelectControlled
            name="prompt"
            options={promptsOptions}
          />
        </FormInput>
        <DefaultFlowNodes />
      </FlowNodeLayout>
    );
  }),

  process(context) {
    const { flow, messageController, node, schemeName } = context;

    const promptId = node.data.prompt?.value;
    if (!promptId) throwNodeError(messageController.message, "Prompt not selected");

    const prompt = flow.prompts.find(prompt => prompt.id === promptId) as Prompt;
    if (!prompt) throwNodeError(messageController.message, "Prompt not found");

    const slug = isDefaultScheme(schemeName)
      ? ChatSwipePrompt.message
      : flow.extraBlocks.find(extraBlock => extraBlock.id === schemeName)?.key;
    if (!slug) return throwNodeError(messageController.message, "Slug not found");
    const currentPrompt = messageController.getPrompt(slug);

    runInAction(() => {
      currentPrompt.requestId = null;
      currentPrompt.message = "";
      currentPrompt.error = null;
      messageController.pending = true;
    });

    const vars = messageController.getPresetVars();

    return sendRequestFromFlow(
      context,
      vars,
      action(({ chunk }) => currentPrompt.message += chunk),
    ).then(action((data) => {
      const { message, error } = data;
      const request: RequestStorageItem = {
        id: uuid(),
        createdAt: new Date(),
        provider: prompt.backendProviderId,
        response: data,
      };
      currentPrompt.message = message;
      currentPrompt.requestId = request.id;
      requestStorage.updateItem(request).then(() => undefined);
      if (error) throwNodeError(currentPrompt, error);
    })).finally(action(() => {
      messageController.pending = false;
    }));
  },
};
