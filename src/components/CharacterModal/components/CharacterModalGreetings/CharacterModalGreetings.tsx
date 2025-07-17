import * as React from "react";
import style from "./CharacterModalGreetings.module.scss";
import { FormInput, TextareaControlled } from "src/components/Form";
import { useFieldArray } from "react-hook-form";
import Button from "src/components/Button";
import { Trash, Plus } from "lucide-react";
import MessageActionButton from "src/routes/SingleChat/components/MessageActionButton";

type Props = Record<string, never>;

const CharacterModalGreetings: React.FC<Props> = () => {
  const { fields, append, remove } = useFieldArray({ name: "greetings" });

  return (
    <div className={style.items}>
      {fields.map((field, index) => (
        <div key={field.id}>
          <FormInput
            label={`#${index + 1}:`}
            action={<MessageActionButton icon={Trash} onClick={() => remove(index)} />}
          >
            <TextareaControlled name={`greetings.${index}.text`} autoHeight />
          </FormInput>
        </div>
      ))}
      <div>
        <Button iconBefore={Plus} type="button" onClick={() => append({ text: "" })}>Add</Button>
      </div>
    </div>
  );
};

export default React.memo(CharacterModalGreetings) as typeof CharacterModalGreetings;
