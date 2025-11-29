import { throwNodeError } from "src/helpers/throwNodeError.ts";
import { Prompt } from "src/store/Prompt.ts";
import { backendProviderDict } from "src/enums/BackendProvider.ts";
import { connectionProxiesManager } from "src/store/ConnectionProxiesManager.ts";

export const sendRequestFromFlow = (
  context: FlowProcessContext,
  vars: PresetVars,
  onUpdate: (event: BackendProviderOnUpdateEvent) => void,
) => {
  const { flow, messageController, node, abortController } = context;

  const promptId = node.data.prompt?.value;
  if (!promptId) throwNodeError(messageController.message, "Prompt not selected");

  const prompt = flow.prompts.find(prompt => prompt.id === promptId) as Prompt;
  if (!prompt) throwNodeError(messageController.message, "Prompt not found");

  const backendProvider = backendProviderDict.getById(prompt.backendProviderId).class;
  if (!backendProvider) throwNodeError(messageController.message, "Backend provider not found");

  const connectionProxy = prompt.connectionProxyId
    ? connectionProxiesManager.dict[prompt.connectionProxyId]
    : undefined;

  const data: BackendProviderGenerateConfig<any> = {
    baseUrl: connectionProxy?.baseUrl,
    key: connectionProxy?.key,
    model: prompt.model,
    messages: prompt.buildMessages(vars),
    stop: prompt.buildStopSequence(vars),
    generationConfig: prompt.generationConfig,
    onUpdate: onUpdate,
    abortController: abortController,
  };

  return backendProvider.generate(data);
};