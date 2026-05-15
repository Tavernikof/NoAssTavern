import * as React from "react";
import style from "./CodeBlockForm.module.scss";
import { FormInput, Input } from "src/components/Form";
import Button from "src/components/Button";
import { ChevronLeft, Plus, Save } from "lucide-react";
import CodeEditor, { CodeEditorApi } from "src/components/CodeEditor";
import { CODE_BLOCK_SNIPPETS } from "src/components/CodeEditor/helpers/codeBlockSnippets";
import { observer } from "mobx-react-lite";

type Props = {
  name: string;
  content: string;
  onNameChange: (name: string) => void;
  onContentChange: (content: string) => void;
  onBack?: () => void;
  onSubmit?: () => void;
};

const CodeBlockForm: React.FC<Props> = (props) => {
  const { name, content, onNameChange, onContentChange, onBack, onSubmit } = props;
  const codeEditorRef = React.useRef<CodeEditorApi>(null);

  React.useEffect(() => {
    codeEditorRef.current?.setValue(content);
  }, []);

  const handleInsertSnippet = React.useCallback((snippet: string) => {
    codeEditorRef.current?.insertSnippet(snippet);
  }, []);

  return (
    <div className={style.container}>
      <div className={style.top}>
        {onBack && (
          <Button
            type="button"
            iconBefore={ChevronLeft}
            onClick={onBack}
          >
            Back to list
          </Button>
        )}
        <div className={style.name}>
          <FormInput label="Name">
            <Input
              value={name}
              onInput={(e) => onNameChange(e.currentTarget.value)}
            />
          </FormInput>
        </div>
      </div>

      <div className={style.editorRow}>
        <div className={style.sidebar}>
          {CODE_BLOCK_SNIPPETS.map((snippet) => (
            <Button
              key={snippet.label}
              type="button"
              size="small"
              iconBefore={Plus}
              title={snippet.documentation}
              onClick={() => handleInsertSnippet(snippet.insertText)}
            >
              {snippet.label}
            </Button>
          ))}
        </div>
        <CodeEditor ref={codeEditorRef} onChange={onContentChange} />
      </div>

      {onSubmit && (
        <div className={style.footer}>
          <Button block type="button" iconBefore={Save} onClick={onSubmit}>Save</Button>
        </div>
      )}
    </div>
  );
};

export default observer(CodeBlockForm) as typeof CodeBlockForm;
