import * as React from "react";
import { PresetEditorController } from "src/components/PromptEditorModal/helpers/PresetEditorController.ts";
import { observer } from "mobx-react-lite";
import { Prompt } from "src/store/Prompt.ts";
import PromptForm from "src/components/PromptEditorModal/components/PromptForm";
import { TabItem } from "src/components/Tabs";
import Tabs from "src/components/Tabs/Tabs.tsx";
import PromptCodeBlocks from "src/components/PromptEditorModal/components/PromptCodeBlocks";
import { backendProviderDict } from "src/enums/BackendProvider.ts";
import { connectionProxiesManager } from "src/store/ConnectionProxiesManager.ts";
import { modelToPrompt } from "src/components/PromptEditorModal/helpers/promptEditorConverter.ts";
import Form from "src/components/Form";
import { PresetEditorControllerContext } from "./helpers/PresetEditorControllerContext.ts";
import { useModalContext } from "src/components/Modals";
import style from "./PromptEditorModal.module.scss";
import Button from "src/components/Button/Button.tsx";
import PromptEditorBackendWatcher from "./components/PromptEditorBackendWatcher";
import PromptCodeBlocksCounter from "src/components/PromptEditorModal/components/PromptCodeBlocksCounter";

type Props = {
  prompt: Prompt,
  initialCodeBlockId?: string,
};

const PromptEditorModal: React.FC<Props> = (props) => {
  const { prompt, initialCodeBlockId } = props;
  const { resolve } = useModalContext();
  const controller = React.useMemo(() => new PresetEditorController(prompt, initialCodeBlockId), [prompt, initialCodeBlockId]);

  const items = React.useMemo<TabItem[]>(() => ([
    {
      key: "prompt",
      title: "Prompt",
      content: () => <PromptForm />,
    },
    {
      key: "code-blocks",
      title: <>Code blocks <PromptCodeBlocksCounter /></>,
      content: () => <PromptCodeBlocks />,
    },
  ]), []);

  return (
    <Form
      className={style.container}

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
        if (!backendProviderId) return;
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
          blocks: controller.getBlocksContent(),
          codeBlocks: controller.getCodeBlocksContent(),
        });
        resolve(prompt);
      }}
    >
      <PresetEditorControllerContext.Provider value={controller}>
        <Tabs
          containerClassName={style.tabs}
          contentClassName={style.tabsContent}
          items={items}
          value={controller.selectedTab}
          onChange={(tab) => controller.setSelectedTab(tab)}
        />

        <div className={style.footer}>
          <div className={style.save}>
            <Button block>Save</Button>
          </div>
        </div>
      </PresetEditorControllerContext.Provider>

      <PromptEditorBackendWatcher generationConfig={prompt.generationConfig} />
    </Form>
  );
};

export default observer(PromptEditorModal) as typeof PromptEditorModal;
