import * as React from "react";
import style from "./CodeBlockForm.module.scss";
import { FormFields, FormInput, InputControlled } from "src/components/Form";
import Button from "src/components/Button/Button.tsx";
import { Save } from "lucide-react";
import Form from "src/components/Form/Form.tsx";
import { CodeBlock } from "src/store/CodeBlock.ts";
import CodeEditor, { CodeEditorApi } from "src/components/CodeEditor";
import { observer } from "mobx-react-lite";

type CodeBlockFormDto = {
  name: string;
}

type Props = {
  codeBlock: CodeBlock;
  onSubmit: (codeBlock: CodeBlock) => void;
};

const CodeBlockForm: React.FC<Props> = (props) => {
  const { codeBlock, onSubmit } = props;
  const codeEditorRef = React.useRef<CodeEditorApi>(null);

  React.useEffect(() => {
    codeEditorRef.current?.setValue(codeBlock.content);
  }, [codeBlock.content]);

  return (
    <Form<CodeBlockFormDto>
      className={style.form}
      initialValue={React.useMemo<CodeBlockFormDto>(() => ({
        name: codeBlock.name,
      }), [codeBlock])}
      onSubmit={React.useCallback((dto: CodeBlockFormDto) => {
        const content = codeEditorRef.current?.getValue();
        if (typeof content !== "string") return;
        codeBlock.update({
          name: dto.name,
          content,
        });
        onSubmit(codeBlock);
      }, [])}
    >
      <FormFields>
        <FormInput label="Name" name="name">
          <InputControlled name="name" />
        </FormInput>
      </FormFields>
      <CodeEditor ref={codeEditorRef} />
      <div className={style.footer}>
        <Button block iconBefore={Save}>Save</Button>
      </div>
    </Form>
  );
};

export default observer(CodeBlockForm) as typeof CodeBlockForm;
