import * as React from "react";
import { ChatMessageRole } from "src/enums/ChatManagerRole.ts";
import { observer } from "mobx-react-lite";
import { Select } from "src/components/Form";
import { PresetEditor } from "src/components/BlockEditor/helpers/PresetEditor.ts";
import PromptBlockContainer
  from "src/components/PromptEditorModal/components/PromptBlockContainer/PromptBlockContainer.tsx";
import Button from "src/components/Button/Button.tsx";
import BlockEditor from "src/components/BlockEditor/BlockEditor.tsx";

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

  React.useEffect(() => editor.setInited(), [editor]);

  return (
    <PromptBlockContainer
      editor={editor}
      toolbar={(
        <>
          <Select
            value={roleOption}
            onChange={(value) => setRole((value as { label: string, value: string }).value as ChatMessageRole)}
            options={options}
          />
          <Button type="button" onClick={editor.toggleBlock}>toggle block</Button>
        </>
      )}
    >
      <BlockEditor editor={editor} />
    </PromptBlockContainer>
  );
};

export default observer(PromptBlockEditor) as typeof PromptBlockEditor;
