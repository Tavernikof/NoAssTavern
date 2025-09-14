import * as React from "react";
import { ChatMessageRole } from "src/enums/ChatManagerRole.ts";
import PromptEditor from "src/components/PromptEditorModal/components/PromptEditor";
import { observer } from "mobx-react-lite";
import { Select } from "src/components/Form";
import { PresetEditor } from "src/components/CodeEditor/helpers/PresetEditor.ts";
// import style from "./PromptBlockEditor.module.scss";

const options = [
  ChatMessageRole.USER,
  ChatMessageRole.ASSISTANT,
  ChatMessageRole.SYSTEM,
].map(role => ({ label: role, value: role }));

type Props = {
  editor: PresetEditor
};

const PromptBlockEditor: React.FC<Props> = (props) => {
  const { editor } = props;
  const { role, setRole } = editor;
  const roleOption = React.useMemo(() => options.find(option => option.value === role), [role]);

  return (
    <PromptEditor
      editor={editor}
      renderToolbar={() => (
        <>
          <Select
            value={roleOption}
            onChange={(value) => setRole((value as { label: string, value: string }).value as ChatMessageRole)}
            options={options}
          />
        </>
      )}
    />
  );
};

export default observer(PromptBlockEditor) as typeof PromptBlockEditor;
