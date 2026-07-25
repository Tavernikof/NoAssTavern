import * as React from "react";
import { FormInput, Select } from "src/components/Form";
import style from "./GenerationPresetSelect.module.scss";
import { useFormContext, useWatch } from "react-hook-form";
import { observer } from "mobx-react-lite";
import { backendProviderDict, BackendProviderItem } from "src/enums/BackendProvider.ts";
import { connectionProxiesManager } from "src/store/ConnectionProxiesManager.ts";
import { generationPresetsManager } from "src/store/GenerationPresetsManager.ts";
import { GenerationPreset } from "src/store/GenerationPreset.ts";
import { openGenerationPresetNameModal } from "src/components/GenerationPresetNameModal";
import { modelToPrompt, promptToModel } from "src/components/PromptEditorModal/helpers/promptEditorConverter.ts";
import { SelectOption } from "src/helpers/createDictionary.ts";
import Button from "src/components/Button";
import { Save, SavePlus } from "lucide-react";
import MessageActionButton from "src/routes/SingleChat/components/MessageActionButton";

type PresetSelectOption = { value: string, label: string };

type Props = Record<string, never>;

const GenerationPresetSelect: React.FC<Props> = () => {
  const form = useFormContext();
  const backendProviderId = useWatch({ name: "backendProviderId" }) as SelectOption<BackendProviderItem> | null;
  const backendProvider = backendProviderId?.original?.class;

  const [selectedPreset, setSelectedPreset] = React.useState<PresetSelectOption | null>(null);

  const applyPreset = (option: PresetSelectOption | null) => {
    setSelectedPreset(option);
    if (!option) return;
    const preset = generationPresetsManager.dict[option.value];
    if (!preset) return;

    form.setValue("backendProviderId", backendProviderDict.selectOptions.find(o => o.value === preset.backendProviderId) ?? null);
    form.setValue("connectionProxy", preset.connectionProxyId
      ? connectionProxiesManager.selectOptions.find(o => o.value === preset.connectionProxyId) ?? null
      : null);
    form.setValue("model", preset.model ? { value: preset.model, label: preset.model } : null);

    const provider = backendProviderDict.getById(preset.backendProviderId);
    if (!provider) return;
    const model = promptToModel(provider, preset.generationConfig);
    for (const key in model) {
      form.setValue(key, model[key]);
    }
  };

  const getSettingsSnapshot = () => {
    const values = form.getValues();
    const provider = backendProviderDict.getById(values.backendProviderId?.value);
    if (!provider) return null;

    return {
      backendProviderId: provider.id,
      connectionProxyId: (values.connectionProxy?.value as string) ?? null,
      model: (values.model?.value as string) ?? "",
      generationConfig: modelToPrompt(provider, values),
    };
  };

  const savePreset = () => {
    if (!selectedPreset) return;
    const preset = generationPresetsManager.dict[selectedPreset.value];
    const snapshot = getSettingsSnapshot();
    if (!preset || !snapshot) return;
    preset.update(snapshot);
  };

  const savePresetAs = () => {
    openGenerationPresetNameModal({}).result.then(name => {
      const snapshot = getSettingsSnapshot();
      if (!snapshot) return;
      const preset = GenerationPreset.createEmpty();
      preset.update({ name: name as string, ...snapshot });
      generationPresetsManager.add(preset);
      setSelectedPreset({ value: preset.id, label: preset.name });
    });
  };

  return (
    <FormInput
      label="Preset:"
      action={(
        <div className={style.actions}>
          {selectedPreset && (
            <MessageActionButton
              icon={Save}
              onClick={savePreset}
              disabled={!backendProvider}
            />
          )}
          <MessageActionButton
            icon={SavePlus}
            onClick={savePresetAs}
            disabled={!backendProvider}
          />
        </div>
      )}
    >
      <Select
        options={generationPresetsManager.selectOptions}
        value={selectedPreset}
        onChange={option => applyPreset(option as PresetSelectOption | null)}
        isClearable
      />
    </FormInput>
  );
};

export default observer(GenerationPresetSelect) as typeof GenerationPresetSelect;
