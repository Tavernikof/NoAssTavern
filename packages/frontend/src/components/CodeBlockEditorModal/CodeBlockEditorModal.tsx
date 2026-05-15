import * as React from "react";
import { CodeBlock } from "src/store/CodeBlock.ts";
import { useModalContext } from "src/components/Modals";
import CodeBlockForm from "src/components/CodeBlockForm";

type Props = {
  codeBlock: CodeBlock,
};

const CodeBlockEditorModal: React.FC<Props> = (props) => {
  const { codeBlock } = props;
  const { resolve } = useModalContext();

  const [name, setName] = React.useState(codeBlock.name);
  const [content, setContent] = React.useState(codeBlock.content);

  const handleSubmit = React.useCallback(() => {
    codeBlock.update({ name, content });
    resolve(codeBlock);
  }, [codeBlock, name, content, resolve]);

  return (
    <CodeBlockForm
      name={name}
      content={content}
      onNameChange={setName}
      onContentChange={setContent}
      onSubmit={handleSubmit}
    />
  );
};

export default React.memo(CodeBlockEditorModal) as typeof CodeBlockEditorModal;
