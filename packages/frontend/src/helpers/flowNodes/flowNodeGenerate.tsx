import { FlowNode } from "src/enums/FlowNode.ts";
import { backendProviderDict } from "src/enums/BackendProvider.ts";
import { connectionProxiesManager } from "src/store/ConnectionProxiesManager.ts";
import { requestStorage, RequestStorageItem } from "src/storages/RequestStorage.ts";
import { v4 as uuid } from "uuid";
import { action, runInAction } from "mobx";
import * as React from "react";
import FlowNodeLayout from "src/components/SchemeEditor/components/FlowNodeLayout/FlowNodeLayout.tsx";
import { FormInput, SelectControlled } from "src/components/Form";
import { DefaultFlowNodes } from "src/components/SchemeEditor";
import { throwNodeError } from "src/helpers/throwNodeError.ts";
import { isDefaultScheme } from "src/enums/SchemeName.ts";
import { ChatSwipePrompt } from "src/enums/ChatSwipePrompt.ts";
import { useFlowEditorContext } from "src/components/FlowEditorModal/helpers/FlowEditorContext.ts";
import { Prompt } from "src/store/Prompt.ts";

type FlowNodeGenerateState = {
  prompt: { value: string, label: string } | null,
}

export const flowNodeGenerate: FlowNodeConfig<FlowNodeGenerateState> = {
  id: FlowNode.generate,
  label: "Generate",
  description: "Generate content with given prompt",

  render: React.memo((props) => {
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

  process({ flow, messageController, node, abortController, schemeName }) {
    const promptId = node.data.prompt?.value;
    if (!promptId) throwNodeError(messageController.message, "Prompt not selected");
    const prompt = flow.prompts.find(prompt => prompt.id === promptId) as Prompt;
    if (!prompt) throwNodeError(messageController.message, "Prompt not found");

    const backendProvider = backendProviderDict.getById(prompt.backendProviderId).class;
    if (!backendProvider) throwNodeError(messageController.message, "Backend provider not found");

    const connectionProxy = prompt.connectionProxyId
      ? connectionProxiesManager.dict[prompt.connectionProxyId]
      : undefined;

    const slug = isDefaultScheme(schemeName)
      ? ChatSwipePrompt.message
      : flow.extraBlocks.find(extraBlock => extraBlock.id === schemeName)?.key;
    if (!slug) return throwNodeError(messageController.message, "Slug not found");
    if (!messageController.currentSwipe.prompts[slug]) runInAction(() => {
      messageController.currentSwipe.prompts[slug] = messageController.createEmptyPromptResult();
    });
    const currentPrompt = messageController.currentSwipe.prompts[slug];
    runInAction(() => {
      currentPrompt.requestId = null;
      currentPrompt.message = "";
      currentPrompt.error = null;
      messageController.pending = true;
    });

    const data: BackendProviderGenerateConfig<any> = {
      messageController,
      baseUrl: connectionProxy?.baseUrl,
      key: connectionProxy?.key,
      model: prompt.model,
      messages: prompt.buildMessages(messageController.getPresetVars()),
      generationConfig: prompt.generationConfig,
      onUpdate: action(({ chunk }) => {
        currentPrompt.message += chunk;
      }),
      abortController: abortController,
    };
    return backendProvider.generate(data).then(action((data) => {
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
