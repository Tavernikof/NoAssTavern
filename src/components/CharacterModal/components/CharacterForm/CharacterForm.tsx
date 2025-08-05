import * as React from "react";
import style from "./CharacterForm.module.scss";
import { FormFields, FormInput, InputControlled, TextareaControlled } from "src/components/Form";
import CharacterModalGreetings from "../CharacterModalGreetings/";
import Button from "src/components/Button/Button.tsx";
import { Save } from "lucide-react";
import Form from "src/components/Form/Form.tsx";
import { Character } from "src/store/Character.ts";

type CharacterModalForm = {
  name: string,
  description: string,
  scenario: string,
  greetings: { text: string }[],
}


type Props = {
  character: Character;
  onSubmit: () => void;
};

const CharacterForm: React.FC<Props> = (props) => {
  const { character, onSubmit } = props;

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
        onSubmit();
      }, [])}
    >
      <FormFields>
        <FormInput label="Name:">
          <InputControlled name="name" />
        </FormInput>
        <FormInput label="Description:">
          <TextareaControlled name="description" autoHeight />
        </FormInput>
        {!character.local && (
          <>
            <FormInput label="Scenario:">
              <TextareaControlled name="scenario" autoHeight />
            </FormInput>
            <FormInput label="Greetings:">
              <CharacterModalGreetings />
            </FormInput>
          </>
        )}
        <div className={style.footer}>
          <Button block iconBefore={Save}>Save</Button>
        </div>
      </FormFields>
    </Form>
  );
};

export default React.memo(CharacterForm) as typeof CharacterForm;
