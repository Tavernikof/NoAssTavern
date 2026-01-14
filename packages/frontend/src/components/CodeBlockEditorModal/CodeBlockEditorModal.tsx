import * as React from "react";
import { CodeBlock } from "src/store/CodeBlock.ts";
import { useModalContext } from "src/components/Modals";
import CodeBlockForm from "src/components/CodeBlockEditorModal/components/CodeBlockForm";

type Props = {
  codeBlock: CodeBlock,
};

const CodeBlockEditorModal: React.FC<Props> = (props) => {
  const { codeBlock } = props;
  const { resolve } = useModalContext();

  return (
    <CodeBlockForm codeBlock={codeBlock} onSubmit={resolve} />
  );
};

export default React.memo(CodeBlockEditorModal) as typeof CodeBlockEditorModal;
