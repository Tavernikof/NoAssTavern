import * as React from "react";
import { useModalContext } from "src/components/Modals";
import { PresetEditorController } from "src/components/CodeEditor/helpers/PresetEditorController.ts";
import { observer } from "mobx-react-lite";
import { PresetEditorControllerContext } from "src/components/CodeEditor/helpers/PresetEditorControllerContext.ts";
import PromptBlockEditor from "src/components/PromptEditorModal/components/PromptBlockEditor";
import style from "./PromptEditorModal.module.scss";
import PresetEditForm from "./components/PresetEditForm";
import Button from "src/components/Button";
import Form from "../Form";
import { connectionProxiesManager } from "src/store/ConnectionProxiesManager.ts";
import { backendProviderDict } from "src/enums/BackendProvider.ts";
import { Prompt } from "src/store/Prompt.ts";
import PromptEditorAddBlock
  from "src/components/PromptEditorModal/components/PromptEditorAddBlock/PromptEditorAddBlock.tsx";

const modelToForm = (v: unknown) => typeof v === "undefined" ? "" : String(v);

const formToModelNumber = (v: string) => v ? Number(v) : undefined;

const formToModelString = (v: string) => v ? v : undefined;

const formToModelArray = (v: string) => v ? v.split(",") : undefined;

type Props = {
  prompt: Prompt,
};

const PromptEditorModal: React.FC<Props> = (props) => {
  const { prompt } = props;
  const { resolve } = useModalContext();
  const controller = React.useMemo(() => new PresetEditorController(prompt), [prompt]);

  return (
    <Form
      initialValue={React.useMemo(() => ({
        name: prompt.name,
        backendProviderId: backendProviderDict.selectOptions.find(o => o.value === prompt.backendProviderId),
        model: prompt.generationConfig.model ? {
          value: prompt.generationConfig.model,
          label: prompt.generationConfig.model,
        } : undefined,
        connectionProxy: prompt.connectionProxyId
          ? connectionProxiesManager.selectOptions.find(option => option.value === prompt.connectionProxyId)
          : undefined,
        stream: prompt.generationConfig.stream,
        temperature: modelToForm(prompt.generationConfig.temperature),
        stopSequences: modelToForm(prompt.generationConfig.stopSequences),
        maxOutputTokens: modelToForm(prompt.generationConfig.maxOutputTokens),
        topP: modelToForm(prompt.generationConfig.topP),
        topK: modelToForm(prompt.generationConfig.topK),
        presencePenalty: modelToForm(prompt.generationConfig.presencePenalty),
        frequencyPenalty: modelToForm(prompt.generationConfig.frequencyPenalty),
        systemPrompt: modelToForm(prompt.generationConfig.systemPrompt),
      }), [prompt])}
      onSubmit={data => {
        prompt.update({
          name: data.name,
          backendProviderId: data.backendProviderId?.value,
          connectionProxyId: data.connectionProxy?.value ?? null,
          generationConfig: {
            model: data.model?.value,
            stream: data.stream,
            temperature: formToModelNumber(data.temperature),
            stopSequences: formToModelArray(data.stopSequences),
            maxOutputTokens: formToModelNumber(data.maxOutputTokens),
            topP: formToModelNumber(data.topP),
            topK: formToModelNumber(data.topK),
            presencePenalty: formToModelNumber(data.presencePenalty),
            frequencyPenalty: formToModelNumber(data.frequencyPenalty),
            systemPrompt: formToModelString(data.systemPrompt),
          },
          blocks: controller.getContent(),
        });
        resolve(prompt);
      }}
    >
      <PresetEditorControllerContext.Provider value={controller}>
        <div className={style.container}>
          <div className={style.aside}>
            <PresetEditForm />
          </div>
          <div className={style.main}>
            {controller.blocks.map(block => (
              <PromptBlockEditor key={block.id} editor={block} />
            ))}
            <PromptEditorAddBlock />
          </div>
        </div>
        <div className={style.footer}>
          <div className={style.footerInner}>
            <div className={style.save}>
              <Button block>Save</Button>
            </div>
          </div>
        </div>
      </PresetEditorControllerContext.Provider>
    </Form>
  );
};

export default observer(PromptEditorModal) as typeof PromptEditorModal;
