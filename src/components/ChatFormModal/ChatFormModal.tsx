import * as React from "react";
// import { useModalContext } from "src/components/Modals";
import Form, { FormFields, FormInput, SelectControlled } from "src/components/Form";
import Button from "src/components/Button";
import { observer } from "mobx-react-lite";
import { charactersManager } from "src/store/CharactersManager.ts";
import { personasManager } from "src/store/PersonasManager.ts";
import { chatsManager } from "src/store/ChatsManager.ts";
import Joi from "joi";
import { useNavigate } from "react-router";
import { flowsManager } from "src/store/FlowsManager.ts";
// import style from "./ChatFormModal.module.scss";

type SelectOption = {
  value: string;
  label: string;
}

const validation = Joi.object({
  character: Joi.object({
    value: Joi.string(),
  }).unknown(true),
  persona: Joi.object({
    value: Joi.string(),
  }).unknown(true),
  flow: Joi.object({
    value: Joi.string(),
  }).unknown(true),
});

type ChatFormFields = {
  character: SelectOption | null;
  persona: SelectOption | null;
  flow: SelectOption | null;
}

type Props = {
  characterId?: string;
  personaId?: string;
  flowId?: string;
};

const ChatFormModal: React.FC<Props> = (props) => {
  const { characterId, personaId, flowId } = props;
  // const { resolve } = useModalContext();
  const navigate = useNavigate();

  const characters = React.useMemo<SelectOption[]>(() => {
    return charactersManager.characters.map(characterId => ({
      value: characterId,
      label: charactersManager.charactersDict[characterId].name,
    }));
  }, [charactersManager.characters]);

  const personas = React.useMemo<SelectOption[]>(() => {
    return personasManager.personas.map(characterId => ({
      value: characterId,
      label: personasManager.personasDict[characterId].name,
    }));
  }, [personasManager.personas]);

  const flows = React.useMemo<SelectOption[]>(() => {
    return flowsManager.flows.map(flowId => ({
      value: flowId,
      label: flowsManager.flowsDict[flowId].name,
    }));
  }, [flowsManager.flows]);

  return (
    <Form<ChatFormFields>
      initialValue={React.useMemo(() => ({
        character: characterId ? characters.find(c => c.value === characterId) : null,
        persona: personaId ? personas.find(p => p.value === personaId) : null,
        flow: flowId ? flows.find(p => p.value === flowId) : null,
      }), [])}
      validationSchema={validation}
      onSubmit={React.useCallback((data: ChatFormFields) => {
        const { character, persona, flow } = data;
        if (!character || !persona || !flow) return null;
        const chat = chatsManager.create({
          characterId: character.value,
          personaId: persona.value,
          flowId: flow.value,
        });
        navigate(`/chats/${chat.id}`);
      }, [])}
    >
      <FormFields>
        <FormInput label="Character:" name="character">
          <SelectControlled
            name="character"
            options={characters}
          />
        </FormInput>
        <FormInput label="Persona:" name="persona">
          <SelectControlled
            name="persona"
            options={personas}
          />
        </FormInput>
        <FormInput label="Flow:" name="flow">
          <SelectControlled
            name="flow"
            options={flows}
          />
        </FormInput>
        <Button>Create</Button>
      </FormFields>
    </Form>
  );
};

export default observer(ChatFormModal) as typeof ChatFormModal;
