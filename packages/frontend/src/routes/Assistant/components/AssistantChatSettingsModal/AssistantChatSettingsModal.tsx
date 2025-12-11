import * as React from "react";
import { useModalContext } from "src/components/Modals";
import style from "./AssistantChatSettingsModal.module.scss";
import Form from "src/components/Form";
import PresetEditForm from "src/components/PromptEditorModal/components/PresetEditForm/PresetEditForm.tsx";
import Button from "src/components/Button";
import { BackendProvider, backendProviderDict } from "src/enums/BackendProvider.ts";
import { connectionProxiesManager } from "src/store/ConnectionProxiesManager.ts";
import { modelToPrompt } from "src/components/PromptEditorModal/helpers/promptEditorConverter.ts";
import PromptEditorBackendWatcher
  from "src/components/PromptEditorModal/components/PromptEditorBackendWatcher/PromptEditorBackendWatcher.tsx";

type Props = {
  backendProviderId: BackendProvider
  connectionProxyId: string | null,
  model: string | null,
  generationConfig: PromptGenerationConfig,
};

const AssistantChatSettingsModal: React.FC<Props> = (props) => {
  const { backendProviderId, model, connectionProxyId, generationConfig } = props;
  const { resolve } = useModalContext();

  return (
    <Form
      initialValue={React.useMemo(() => ({
        backendProviderId: backendProviderDict.selectOptions.find(o => o.value === backendProviderId),
        connectionProxy: connectionProxyId
          ? connectionProxiesManager.selectOptions.find(option => option.value === connectionProxyId)
          : undefined,
        model: model ? { value: model, label: model } : undefined,
      }), [])}
      onSubmit={(data) => {
        const backendProviderId = data.backendProviderId?.value;
        if(!backendProviderId) return;
        const backendProvider = backendProviderDict.getById(backendProviderId);
        if (!backendProvider) return;
        resolve({
          backendProviderId: data.backendProviderId?.value,
          connectionProxyId: data.connectionProxy?.value ?? null,
          model: data.model?.value,
          generationConfig: {
            ...modelToPrompt(backendProvider, data),
          },
        });
      }}
    >
      <div className={style.form}>
        <PromptEditorBackendWatcher generationConfig={generationConfig} />
        <PresetEditForm />
        <div className={style.footer}>
          <Button>Save</Button>
        </div>
      </div>
    </Form>
  );
};

export default React.memo(AssistantChatSettingsModal) as typeof AssistantChatSettingsModal;
