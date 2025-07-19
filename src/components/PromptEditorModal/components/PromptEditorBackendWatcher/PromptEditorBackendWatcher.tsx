import * as React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { backendProviderDict } from "src/enums/BackendProvider.ts";
import { usePresetEditorControllerContext } from "src/components/CodeEditor/helpers/PresetEditorControllerContext.ts";
import { promptToModel } from "src/components/PromptEditorModal/helpers/promptEditorConverter.ts";

type Props = Record<string, never>;

const PromptEditorBackendWatcher: React.FC<Props> = () => {
  const form = useFormContext();
  const backendProviderValue = useWatch({ name: "backendProviderId" });
  const controller = usePresetEditorControllerContext();

  const backendProviderId = backendProviderValue?.value;
  React.useEffect(() => {
    const backendProvider = backendProviderDict.getById(backendProviderId);
    if (!backendProvider) return;
    const { prompt } = controller;

    const model = promptToModel(backendProvider, prompt);
    for (const key in model) {
      form.setValue(key, model[key]);
    }
  }, [form, backendProviderId]);

  return null;
};

export default React.memo(PromptEditorBackendWatcher) as typeof PromptEditorBackendWatcher;
