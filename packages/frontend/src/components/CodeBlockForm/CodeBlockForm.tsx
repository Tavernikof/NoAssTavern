import * as React from "react";
import style from "./CodeBlockForm.module.scss";
import { FormInput, Input } from "src/components/Form";
import Button from "src/components/Button";
import { ChevronLeft, Save } from "lucide-react";
import CodeEditor, { CodeEditorApi } from "src/components/CodeEditor";
import { CODE_BLOCK_SNIPPETS } from "src/components/CodeEditor/helpers/codeBlockSnippets";
import { observer } from "mobx-react-lite";

type Props = {
  name: string;
  content: string;
  mediaGallery: MediaGallery;
  onNameChange: (name: string) => void;
  onContentChange: (content: string) => void;
  onBack?: () => void;
  onSubmit?: () => void;
};

const CodeBlockForm: React.FC<Props> = (props) => {
  const { name, content, mediaGallery, onNameChange, onContentChange, onBack, onSubmit } = props;
  const codeEditorRef = React.useRef<CodeEditorApi>(null);

  React.useEffect(() => {
    codeEditorRef.current?.setValue(content);
  }, []);

  const handleInsertSnippet = React.useCallback((snippet: string) => {
    codeEditorRef.current?.insertSnippet(snippet);
  }, []);

  const handleInsertAttachment = React.useCallback((attachmentName: string) => {
    const escaped = attachmentName.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
    codeEditorRef.current?.insertSnippet(`await getFileUrl("${escaped}")`);
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
        <CodeEditor ref={codeEditorRef} onChange={onContentChange} />

        <div className={style.sidebar}>
          <div className={style.sidebarHeader}>Code snippet:</div>
          {CODE_BLOCK_SNIPPETS.map((snippet) => (
            <Button
              key={snippet.label}
              type="button"
              size="small"
              title={snippet.documentation}
              onClick={() => handleInsertSnippet(snippet.insertText)}
            >
              {snippet.label}
            </Button>
          ))}
          {Array.isArray(mediaGallery) && (
            <>
              <div className={style.sidebarHeader}>Media:</div>
              {mediaGallery.map(({ file, source }) => (
                <Button
                  key={file.id}
                  type="button"
                  size="small"
                  title={`Source: ${source}`}
                  onClick={() => handleInsertAttachment(file.name)}
                >
                  {file.name}
                </Button>
              ))}
            </>
          )}
        </div>
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
