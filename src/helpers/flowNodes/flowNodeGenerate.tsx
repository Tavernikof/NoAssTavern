import { FlowNode } from "src/enums/FlowNode.ts";
import { promptsManager } from "src/store/PromptsManager.ts";
import { backendProviderDict } from "src/enums/BackendProvider.ts";
import { connectionProxiesManager } from "src/store/ConnectionProxiesManager";
import { requestStorage, RequestStorageItem } from "src/storages/RequestStorage.ts";
import { v4 as uuid } from "uuid";
import { action, runInAction } from "mobx";
import { prepareMessage } from "src/helpers/prepareMessage.ts";
import * as React from "react";
import FlowNodeLayout from "src/components/SchemeEditor/components/FlowNodeLayout/FlowNodeLayout.tsx";
import { FormInput, SelectControlled } from "src/components/Form";
import { DefaultFlowNodes } from "src/components/SchemeEditor";
import { throwNodeError } from "src/helpers/throwNodeError.ts";
import { isDefaultScheme } from "src/enums/SchemeName.ts";
import { ChatSwipePrompt } from "src/enums/ChatSwipePrompt.ts";

type FlowNodeGenerateState = {
  prompt: { value: string, label: string } | null,
}

export const flowNodeGenerate: FlowNodeConfig<FlowNodeGenerateState> = {
  id: FlowNode.generate,
  label: "Generate",
  description: "Generate content with given prompt",

  render: React.memo((props) => {
    return (
      <FlowNodeLayout initialValue={props.data}>
        <FormInput label="Prompt">
          <SelectControlled
            name="prompt"
            options={promptsManager.prompts.map(promptId => {
              const prompt = promptsManager.promptsDict[promptId];
              return {
                value: promptId,
                label: prompt.name,
              };
            })}
          />
        </FormInput>
        <DefaultFlowNodes />
      </FlowNodeLayout>
    );
  }),

  process({ flow, messageController, node, abortController, schemeName }) {
    const promptId = node.data.prompt?.value;
    if (!promptId) throwNodeError(messageController.message, "Prompt not selected");
    const prompt = promptsManager.promptsDict[promptId as string];
    if (!prompt) throwNodeError(messageController.message, "Prompt not found");

    const backendProvider = backendProviderDict.getById(prompt.backendProviderId).class;
    if (!backendProvider) throwNodeError(messageController.message, "Backend provider not found");

    const connectionProxy = prompt.connectionProxyId
      ? connectionProxiesManager.proxiesDict[prompt.connectionProxyId]
      : undefined;

    const { generationConfig } = prompt;
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

    const data: BackendProviderGenerateConfig = {
      baseUrl: connectionProxy?.baseUrl,
      key: connectionProxy?.key,
      model: generationConfig.model,
      messages: prompt.buildMessages(messageController.getPresetVars()),
      stream: generationConfig.stream,
      temperature: generationConfig.temperature,
      stopSequences: (generationConfig.stopSequences ?? []).map(str => prepareMessage(str, messageController.getPresetVars())),
      maxTokens: generationConfig.maxOutputTokens,
      topP: generationConfig.topP,
      topK: generationConfig.topK,
      presencePenalty: generationConfig.presencePenalty,
      frequencyPenalty: generationConfig.frequencyPenalty,
      system: generationConfig.systemPrompt,
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
