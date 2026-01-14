import * as React from "react";
import style from "./PromptCodeBlock.module.scss";
import Button from "src/components/Button";
import { ChevronLeft } from "lucide-react";
import { FormInput, Input } from "src/components/Form";
import CodeEditor, { CodeEditorApi } from "src/components/CodeEditor/CodeEditor.tsx";
import { observer } from "mobx-react-lite";
import { PresetEditorCodeBlock } from "src/components/PromptEditorModal/helpers/PresetEditorCodeBlock.ts";

type Props = {
  onBack: () => void;
  promptCodeBlock: PresetEditorCodeBlock;
};

const PromptCodeBlock: React.FC<Props> = (props) => {
  const { onBack, promptCodeBlock } = props;
  const codeEditorRef = React.useRef<CodeEditorApi>(null);

  React.useEffect(() => {
    codeEditorRef.current?.setValue(promptCodeBlock.content);
  }, []);

  return (
    <div className={style.container}>
      <div className={style.top}>
        <Button
          type="button"
          iconBefore={ChevronLeft}
          onClick={onBack}
        >
          Back to list
        </Button>
        <div className={style.name}>
          <FormInput label="Name" name="name">
            <Input
              name="name"
              value={promptCodeBlock.name}
              onInput={(e) => promptCodeBlock.setName(e.currentTarget.value)}
            />
          </FormInput>
        </div>
      </div>

      <CodeEditor ref={codeEditorRef} onChange={(content) => promptCodeBlock.setContent(content)} />
    </div>
  );
};

export default observer(PromptCodeBlock) as typeof PromptCodeBlock;
