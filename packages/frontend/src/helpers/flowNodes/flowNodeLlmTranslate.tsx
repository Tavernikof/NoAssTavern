import "react";
import { FlowNode } from "src/enums/FlowNode.ts";
import { action, runInAction } from "mobx";
import FlowNodeLayout from "src/components/SchemeEditor/components/FlowNodeLayout/FlowNodeLayout.tsx";
import { CheckboxControlled, FormInput, SelectControlled } from "src/components/Form";
import { DefaultFlowNodes } from "src/components/SchemeEditor";
import { throwNodeError } from "src/helpers/throwNodeError.ts";
import { ChatSwipePrompt } from "src/enums/ChatSwipePrompt.ts";
import { useFlowEditorContext } from "src/components/FlowEditorModal/helpers/FlowEditorContext.ts";
import { Prompt } from "src/store/Prompt.ts";
import { sendRequestFromFlow } from "src/helpers/sendRequestFromFlow.ts";
import { observer } from "mobx-react-lite";
import { CodeBlockFunction } from "src/enums/CodeBlockFunction.ts";

type FlowNodeGenerateState = {
  prompt: { value: string, label: string } | null,
  overwriteTranslate: boolean
}

export const flowNodeLlmTranslate: FlowNodeConfig<FlowNodeGenerateState> = {
  id: FlowNode.llmTranslate,
  label: "LLM translate",
  description: "Translates last message through LLM with given prompt",
  initialState: {
    prompt: null,
    overwriteTranslate: false,
  },
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
        <CheckboxControlled
          name="overwriteTranslate"
          label="Overwrite original message"
        />
        <DefaultFlowNodes />
      </FlowNodeLayout>
    );
  }),

  process(context) {
    const { flow, messageController, node } = context;

    const promptId = node.data.prompt?.value;
    if (!promptId) throwNodeError(messageController.message, "Prompt not selected");

    const prompt = flow.prompts.find(prompt => prompt.id === promptId) as Prompt;
    if (!prompt) throwNodeError(messageController.message, "Prompt not found");

    const overwriteTranslate = node.data.overwriteTranslate ?? false;

    if (overwriteTranslate && messageController.translate.message) return;

    const text = messageController.message.message;
    if (!text) return;

    let _overwritten = false;
    const updateMessage = async (translatedText: string) => {
      const result = await prompt.callCodeBlockFunction(CodeBlockFunction.onMessage, { message: translatedText });
      runInAction(() => {
        if (overwriteTranslate) {
          if (!_overwritten) messageController[ChatSwipePrompt.translate].message = text;
          _overwritten = true;
          messageController[ChatSwipePrompt.message].message = result.message;
        } else {
          messageController.translate.message = result.message;
        }
        messageController.showTranslate = true;
      });
    };

    runInAction(() => {
      messageController.translate.requestId = null;
      messageController.translate.message = "";
      messageController.translate.error = null;
    });

    const promise = sendRequestFromFlow(
      context,
      (prompt) => messageController.getPresetVars({ prompt }),
      ({ message }) => updateMessage(message),
    ).then(
      (data) => {
        const { message, error } = data;
        if (message) updateMessage(message);
        if (error) throwNodeError(messageController.translate, error);
      },
      action((error) => {
        if (error) throwNodeError(messageController.translate, error);
      }),
    );

    flow.registerAsyncProcess(messageController, promise);

    return promise;
  },
};
