import * as React from "react";
import { useModalContext } from "src/components/Modals";
import Form, { FormFields, FormInput, InputControlled } from "src/components/Form";
import style from "./GenerationPresetNameModal.module.scss";
import Button from "src/components/Button/Button.tsx";

type GenerationPresetNameForm = {
  name: string,
}

type Props = {
  initialName?: string;
};

const GenerationPresetNameModal: React.FC<Props> = (props) => {
  const { initialName } = props;
  const { resolve } = useModalContext();

  return (
    <Form<GenerationPresetNameForm>
      initialValue={React.useMemo(() => ({
        name: initialName ?? "",
      }), [])}
      onSubmit={React.useCallback((data: GenerationPresetNameForm) => {
        if (!data.name.trim()) return;
        resolve(data.name.trim());
      }, [])}
    >
      <FormFields>
        <FormInput label="Name:">
          <InputControlled name="name" />
        </FormInput>
        <div className={style.footer}>
          <Button>Save</Button>
        </div>
      </FormFields>
    </Form>
  );
};

export default React.memo(GenerationPresetNameModal) as typeof GenerationPresetNameModal;
