import * as React from "react";
import { useModalContext } from "src/components/Modals";
import { observer } from "mobx-react-lite";
import { Character } from "src/store/Character.ts";
import Form from "src/components/Form/Form.tsx";
import { FormFields, FormInput, InputControlled, TextareaControlled } from "src/components/Form";
import Button from "src/components/Button/Button.tsx";
import style from "./CharacterModal.module.scss";
import CharacterModalGreetings from "./components/CharacterModalGreetings";
import { Save } from "lucide-react";

type CharacterModalForm = {
  name: string,
  description: string,
  scenario: string,
  greetings: { text: string }[],
}

type Props = {
  character: Character;
};

const CharacterModal: React.FC<Props> = (props) => {
  const { character } = props;
  const { resolve } = useModalContext();

  return (
    <Form<CharacterModalForm>
      initialValue={React.useMemo(() => ({
        name: character.name,
        description: character.description,
        scenario: character.scenario,
        greetings: (character.greetings).map(text => ({ text })),
      }), [])}
      onSubmit={React.useCallback((data: CharacterModalForm) => {
        character.update({
          ...data,
          greetings: data.greetings.map(g => g.text),
        });
        resolve(character);
      }, [])}
    >
      <FormFields>
        <FormInput label="Name:">
          <InputControlled name="name" />
        </FormInput>
        <FormInput label="Description:">
          <TextareaControlled name="description" autoHeight />
        </FormInput>
        <FormInput label="Personality:">
          <TextareaControlled name="personality" autoHeight />
        </FormInput>
        <FormInput label="Scenario:">
          <TextareaControlled name="scenario" autoHeight />
        </FormInput>
        <FormInput label="Greetings:">
          <CharacterModalGreetings />
        </FormInput>
        <div className={style.footer}>
          <Button iconBefore={Save}>Save</Button>
        </div>
      </FormFields>
    </Form>
  );
};

export default observer(CharacterModal) as typeof CharacterModal;
