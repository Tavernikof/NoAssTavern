import * as React from "react";
import { useModalContext } from "src/components/Modals";
import { Persona } from "src/store/Persona.ts";
import style from "./PersonaModalModal.module.scss";
import Form, { FormInput, InputControlled, TextareaControlled } from "src/components/Form";
import Button from "src/components/Button";

type PersonaModalForm = {
  name: string,
  description: string,
}

type Props = {
  persona: Persona,
};

const PersonaModal: React.FC<Props> = (props) => {
  const { persona } = props;
  const { resolve } = useModalContext();

  return (
    <Form<PersonaModalForm>
      initialValue={React.useMemo(() => ({
        name: persona.name,
        description: persona.description,
      }), [])}
      onSubmit={React.useCallback((data: PersonaModalForm) => {
        persona.update(data);
        resolve(persona);
      }, [])}
    >
      <FormInput label="Name:">
        <InputControlled name="name" />
      </FormInput>
      <FormInput label="Description:">
        <TextareaControlled name="description" autoHeight />
      </FormInput>
      <div className={style.footer}>
        <Button>Save</Button>
      </div>
    </Form>
  );
};

export default React.memo(PersonaModal) as typeof PersonaModal;
