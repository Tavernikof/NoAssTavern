import * as React from "react";
import { useModalContext } from "src/components/Modals";
import style from "./ReplacePresetModal.module.scss";
import Form, { FormFields, FormInput, SelectControlled } from "src/components/Form";
import Button from "src/components/Button/Button.tsx";
import { Chat } from "src/store/Chat.ts";
import { promptsManager } from "src/store/PromptsManager.ts";
import { observer } from "mobx-react-lite";
import { SelectOption } from "src/components/Form/components/Select/SelectControlled";

type ReplacePresetDto = {
  preset: SelectOption | null;
}

type Props = {
  chat: Chat
};

const ReplacePresetModal: React.FC<Props> = (props) => {
  const { chat } = props;
  const { presetId } = chat;
  const { resolve } = useModalContext();

  const presets = React.useMemo<SelectOption[]>(() => {
    return promptsManager.presets.map(presetId => ({
      value: presetId,
      label: promptsManager.presetsDict[presetId].name,
    }));
  }, [promptsManager.presets]);


  return (
    <Form<ReplacePresetDto>
      initialValue={React.useMemo(() => ({
        preset: presetId ? presets.find(p => p.value === presetId) : null,
      }), [presetId])}
      onSubmit={React.useCallback((data) => {
        const { preset } = data;
        if (!preset) return;
        chat.replacePreset(preset.value);
        resolve();
      }, [])}
    >
      <FormFields>
        <FormInput label="Preset:" name="preset">
          <SelectControlled
            name="preset"
            options={presets}
          />
        </FormInput>
        <Button>Replace</Button>
      </FormFields>
    </Form>
  );
};

export default observer(ReplacePresetModal) as typeof ReplacePresetModal;
