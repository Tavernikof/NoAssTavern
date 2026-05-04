import * as React from "react";
import style from "./PromptHistoryBlockEditor.module.scss";
import { PresetHistoryEditor } from "src/components/BlockEditor/helpers/PresetHistoryEditor.ts";
import PromptBlockContainer
  from "src/components/PromptEditorModal/components/PromptBlockContainer/PromptBlockContainer.tsx";
import { FormInput, Input } from "src/components/Form";

type Props = {
  editor: PresetHistoryEditor
};

const numberToString = (value: number | null) => value !== null ? String(value) : "";

const PromptHistoryBlockEditor: React.FC<Props> = (props) => {
  const { editor } = props;
  const [from, setFrom] = React.useState(() => numberToString(editor.from));
  const [to, setTo] = React.useState(() => numberToString(editor.to));

  React.useEffect(() => {
    setFrom(numberToString(editor.from));
  }, [editor.from]);

  React.useEffect(() => {
    setTo(numberToString(editor.to));
  }, [editor.to]);

  const updateFrom = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setFrom(value);
    editor.setFrom(value);
  }, [editor]);

  const updateTo = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setTo(value);
    editor.setTo(value);
  }, [editor]);

  return (
    <PromptBlockContainer
      editor={editor}
      toolbar={(
        <>
          History
        </>
      )}
    >
      <div className={style.container}>
        <FormInput label="From:">
          <Input value={from} onChange={updateFrom} type="number" />
        </FormInput>

        <FormInput label="To:">
          <Input value={to} onChange={updateTo} type="number" />
        </FormInput>
      </div>
    </PromptBlockContainer>
  );
};

export default React.memo(PromptHistoryBlockEditor) as typeof PromptHistoryBlockEditor;
