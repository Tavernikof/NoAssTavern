import * as React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { backendProviderDict } from "src/enums/BackendProvider.ts";
import { promptToModel } from "src/components/PromptEditorModal/helpers/promptEditorConverter.ts";

type Props = {
  generationConfig: PromptGenerationConfig
};

const PromptEditorBackendWatcher: React.FC<Props> = (props) => {
  const { generationConfig } = props;
  const form = useFormContext();
  const backendProviderValue = useWatch({ name: "backendProviderId" });

  const backendProviderId = backendProviderValue?.value;
  React.useEffect(() => {
    const backendProvider = backendProviderDict.getById(backendProviderId);
    if (!backendProvider) return;

    const model = promptToModel(backendProvider, { ...generationConfig, ...form.getValues() });
    for (const key in model) {
      form.setValue(key, model[key]);
    }
  }, [form, backendProviderId, generationConfig]);

  return null;
};

export default React.memo(PromptEditorBackendWatcher) as typeof PromptEditorBackendWatcher;
