import * as React from "react";
import { CheckboxControlled, FormInput, Select } from "src/components/Form";
import { charactersManager } from "src/store/CharactersManager.ts";
import { ChatFormFields, SelectOption } from "src/components/ChatFormModal/ChatFormModal.tsx";
import { observer } from "mobx-react-lite";
import { Chat } from "src/store/Chat.ts";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import style from "./ChatFormCharacters.module.scss";
import { ActionMeta } from "react-select";
import { RadioControlled } from "src/components/Form/components/Radio";
import MessageActionButton from "src/routes/SingleChat/components/MessageActionButton";
import { Trash, Users } from "lucide-react";
import { useChatFormContext } from "src/components/ChatFormModal/components/helpers/ChatFormContext.ts";

type Props = {
  chat?: Chat
};

const ChatFormCharacters: React.FC<Props> = (props) => {
  const { chat } = props;
  const { setValue } = useFormContext<ChatFormFields>();
  const { addScenario, removeScenario } = useChatFormContext();
  const { fields, remove, append } = useFieldArray<ChatFormFields, "characters">({ name: "characters" });
  const persona = useWatch<ChatFormFields, "persona">({ name: "persona" });

  const characters = React.useMemo<SelectOption[]>(() => {
    const characters = charactersManager.fullList.map(character => ({
      value: character.id,
      label: charactersManager.getLabel(character),
    }));
    if (chat) {
      chat.characters.map(({ character }) => characters.unshift(({
        value: character.id,
        label: `${character.name} (current)`,
      })));
    }
    return characters;
  }, [chat, charactersManager.fullList]);

  const charactersOptions = React.useMemo(() => {
    return fields.map(({ character }) => characters.find(c => c.value === character));
  }, [fields, characters]);

  React.useEffect(() => {
    if (!fields.find(({ character }) => character === persona)) {
      setValue("persona", fields.length ? fields[0].character : null);
    }
  }, [persona, fields]);

  return (
    <>
      <FormInput icon={Users} label="Characters:" name="characters">
        <Select
          value={charactersOptions}
          onChange={(_, _meta) => {
            const meta = _meta as ActionMeta<{ value: string, label: string }>;
            if (meta.removedValues) {
              const indexes: number[] = [];
              meta.removedValues.forEach((removedValue) => {
                const index = fields.findIndex(v => v.character === removedValue.value);
                if (index !== -1) indexes.push(index);
                removeScenario(removedValue.value);
              });
              if (indexes.length) remove(indexes);
            } else if (meta.removedValue) {
              const index = fields.findIndex(v => v.character === (meta.removedValue as {
                value: string,
                label: string
              }).value);
              if (index !== -1) remove(index);
              removeScenario(meta.removedValue.value);
            } else if (meta.option) {
              append({
                character: meta.option.value,
                name: meta.option.label,
                active: true,
              });
              addScenario(meta.option.value);
            }
          }}
          options={characters}
          isMulti
        />
      </FormInput>

      {!!fields.length && (
        <table className={style.characters}>
          <thead>
          <tr>
            <th>Character</th>
            <th className={style.cell}>Persona</th>
            <th className={style.cell}>Active</th>
            <th className={style.cell}></th>
          </tr>
          </thead>
          <tbody>
          {fields.map(({ name, character }, index) => {
            if (!fields[index]) return null;
            return (
              <tr key={fields[index].id} className={style.character}>
                <td className={style.name}>{name}</td>
                <td className={style.cell}>
                  <div className={style.end}>
                    <RadioControlled
                      name="persona"
                      value={character}
                    />
                  </div>
                </td>
                <td className={style.cell}>
                  <div className={style.end}>
                    <CheckboxControlled name={`characters.${index}.active`} />
                  </div>
                </td>
                <td className={style.cell}>
                  <div className={style.end}>
                    <MessageActionButton icon={Trash} onClick={() => remove(index)} />
                  </div>
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      )}
    </>
  );
};

export default observer(ChatFormCharacters) as typeof ChatFormCharacters;
