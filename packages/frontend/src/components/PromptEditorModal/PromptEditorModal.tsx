import * as React from "react";
import { useModalContext } from "src/components/Modals";
import { PresetEditorController } from "src/components/CodeEditor/helpers/PresetEditorController.ts";
import { observer } from "mobx-react-lite";
import { PresetEditorControllerContext } from "src/components/CodeEditor/helpers/PresetEditorControllerContext.ts";
import PromptBlockEditor from "src/components/PromptEditorModal/components/PromptBlockEditor";
import style from "./PromptEditorModal.module.scss";
import PresetEditForm from "./components/PresetEditForm";
import Button from "src/components/Button";
import Form, { FormInput, InputControlled } from "../Form";
import { connectionProxiesManager } from "src/store/ConnectionProxiesManager.ts";
import { backendProviderDict } from "src/enums/BackendProvider.ts";
import { Prompt } from "src/store/Prompt.ts";
import PromptEditorAddBlock
  from "src/components/PromptEditorModal/components/PromptEditorAddBlock/PromptEditorAddBlock.tsx";
import PromptEditorBackendWatcher from "./components/PromptEditorBackendWatcher";
import { modelToPrompt } from "src/components/PromptEditorModal/helpers/promptEditorConverter.ts";

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
        model: prompt.model ? { value: prompt.model, label: prompt.model } : undefined,
        connectionProxy: prompt.connectionProxyId
          ? connectionProxiesManager.selectOptions.find(option => option.value === prompt.connectionProxyId)
          : undefined,
      }), [prompt])}
      onSubmit={data => {
        const backendProviderId = data.backendProviderId?.value;
        if(!backendProviderId) return;
        const backendProvider = backendProviderDict.getById(backendProviderId);
        if (!backendProvider) return;
        prompt.update({
          name: data.name,
          backendProviderId: data.backendProviderId?.value,
          connectionProxyId: data.connectionProxy?.value ?? null,
          model: data.model?.value,
          generationConfig: {
            ...prompt.generationConfig,
            ...modelToPrompt(backendProvider, data),
          },
          blocks: controller.getContent(),
        });
        resolve(prompt);
      }}
    >
      <PresetEditorControllerContext.Provider value={controller}>
        <div className={style.container}>
          <div className={style.aside}>
            <FormInput label="Name:" name="name">
              <InputControlled name="name" />
            </FormInput>

            <hr className={style.separator} />

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
        <PromptEditorBackendWatcher generationConfig={prompt.generationConfig} />
      </PresetEditorControllerContext.Provider>
    </Form>
  );
};

export default observer(PromptEditorModal) as typeof PromptEditorModal;
