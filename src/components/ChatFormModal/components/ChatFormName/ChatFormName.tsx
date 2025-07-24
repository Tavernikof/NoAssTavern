import * as React from "react";
import { FormInput, InputControlled } from "src/components/Form";
import { useWatch } from "react-hook-form";
import { ChatFormFields } from "src/components/ChatFormModal/ChatFormModal.tsx";
// import style from "./ChatFormName.module.scss";

type Props = Record<string, never>;

const ChatFormName: React.FC<Props> = () => {
  const characters = useWatch<ChatFormFields, "characters">({ name: "characters" });

  const placeholder = React.useMemo(() => {
    return characters.map(({ name }) => name).join(", ");
  }, [characters]);

  return (
    <FormInput label="Chat name:" name="name">
      <InputControlled
        name="name"
        placeholder={placeholder}
      />
    </FormInput>
  );
};

export default React.memo(ChatFormName) as typeof ChatFormName;
