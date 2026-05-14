import * as React from "react";
import CodeBlocksEditorBlock from "./components/CodeBlocksEditorBlock";
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
    <CodeBlocksEditorBlock
      promptCodeBlock={selectedCodeBlock}
      onBack={() => controller.selectCodeBlock(null)}
    />
  );
  return <CodeBlocksEditorList controller={controller} />;
};

export default observer(CodeBlocksEditor) as typeof CodeBlocksEditor;
