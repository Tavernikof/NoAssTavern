import * as React from "react";
import CodeBlockForm from "src/components/CodeBlockForm";
import CodeBlocksEditorList from "./components/CodeBlocksEditorList";
import { CodeBlocksEditorController } from "src/components/CodeBlocksEditor/helpers/CodeBlocksEditorController.ts";
import { observer } from "mobx-react-lite";

type Props = {
  controller: CodeBlocksEditorController;
};

const CodeBlocksEditor: React.FC<Props> = (props) => {
  const { controller } = props;
  const { selectedCodeBlock } = controller;

  if (selectedCodeBlock) return (
    <CodeBlockForm
      name={selectedCodeBlock.name}
      content={selectedCodeBlock.content}
      onNameChange={(value) => selectedCodeBlock.setName(value)}
      onContentChange={(value) => selectedCodeBlock.setContent(value)}
      onBack={() => controller.selectCodeBlock(null)}
    />
  );
  return <CodeBlocksEditorList controller={controller} />;
};

export default observer(CodeBlocksEditor) as typeof CodeBlocksEditor;
