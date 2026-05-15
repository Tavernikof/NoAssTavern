import * as React from "react";
import { observer } from "mobx-react-lite";
import { CodeBlocksEditorController } from "src/components/CodeBlocksEditor/helpers/CodeBlocksEditorController.ts";

type Props = {
  controller: CodeBlocksEditorController;
};


const CodeBlocksEditorCounter: React.FC<Props> = (props) => {
  const { controller } = props;
  const { codeBlocks } = controller;

  const activeCount = codeBlocks.filter(codeBlock => codeBlock.active).length;
  const totalCount = codeBlocks.length;
  if(!totalCount) return
  return totalCount === activeCount ? `(${totalCount})` : `(${activeCount}/${totalCount})`;
};

export default observer(CodeBlocksEditorCounter) as typeof CodeBlocksEditorCounter;
