import * as React from "react";
import style from "./CodeBlocksEditorBlock.module.scss";
import Button from "src/components/Button";
import { ChevronLeft } from "lucide-react";
import { FormInput, Input } from "src/components/Form";
import CodeEditor, { CodeEditorApi } from "src/components/CodeEditor/CodeEditor.tsx";
import { observer } from "mobx-react-lite";
import { CodeBlockEditorBlockController } from "../../helpers/CodeBlockEditorBlockController.ts";

type Props = {
  onBack: () => void;
  promptCodeBlock: CodeBlockEditorBlockController;
};

const CodeBlocksEditorBlock: React.FC<Props> = (props) => {
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
          <FormInput label="Name">
            <Input
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

export default observer(CodeBlocksEditorBlock) as typeof CodeBlocksEditorBlock;
