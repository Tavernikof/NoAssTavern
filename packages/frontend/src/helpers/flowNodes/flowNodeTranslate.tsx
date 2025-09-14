import { FlowNode } from "src/enums/FlowNode.ts";
import { translateText } from "src/helpers/translateText.ts";
import { TranslateLanguage } from "src/helpers/translateTextYandex.ts";
import { action, runInAction } from "mobx";
import { CheckboxControlled, FormInput, SelectControlled } from "src/components/Form";
import * as React from "react";
import { DefaultFlowNodes } from "src/components/SchemeEditor";
import FlowNodeLayout from "src/components/SchemeEditor/components/FlowNodeLayout";
import { throwNodeError } from "src/helpers/throwNodeError.ts";
import { ChatSwipePrompt } from "src/enums/ChatSwipePrompt.ts";

type FlowNodeTranslateState = {
  language: { value: string, label: string } | null,
  overwriteTranslate: boolean
}

export const flowNodeTranslate: FlowNodeConfig<FlowNodeTranslateState> = {
  id: FlowNode.translate,
  label: "Translate",
  description: "Translate last message",
  initialState: {
    language: null,
    overwriteTranslate: false,
  },
  render: React.memo((props) => {
    return (
      <FlowNodeLayout initialValue={props.data}>
        <FormInput label="Target language">
          <SelectControlled
            name="language"
            options={[
              {
                value: TranslateLanguage.ru,
                label: TranslateLanguage.ru,
              },
              {
                value: TranslateLanguage.en,
                label: TranslateLanguage.en,
              },
            ]}
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

  process({ messageController, node }) {
    const text = messageController.message.message;
    if (!text) return;

    const targetLanguage = node.data.language?.value as TranslateLanguage;
    if (!targetLanguage) throwNodeError(messageController.message, "Language not found");
    const overflowTranslate = node.data.overwriteTranslate ?? false;

    if (overflowTranslate && messageController.translate.message) return;

    runInAction(() => messageController.pending = true);
    return translateText(text, targetLanguage).then(
      action(translatedText => {
        if (overflowTranslate) {
          messageController[ChatSwipePrompt.translate].message = text;
          messageController[ChatSwipePrompt.message].message = translatedText;
        } else {
          messageController.translate.message = translatedText;
        }
        messageController.showTranslate = true;
        messageController.pending = false;
      }),
      action((error) => {
        messageController.message.error = error.error;
        messageController.pending = false;
        throw error;
      }),
    );
  },
};
