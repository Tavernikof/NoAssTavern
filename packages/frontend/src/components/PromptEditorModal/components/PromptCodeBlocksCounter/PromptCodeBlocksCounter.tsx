import * as React from "react";
import { usePresetEditorControllerContext } from "../../helpers/PresetEditorControllerContext.ts";
import { observer } from "mobx-react-lite";

type Props = Record<string, never>;

const PromptCodeBlocksCounter: React.FC<Props> = () => {
  const controller = usePresetEditorControllerContext();
  const { codeBlocks } = controller;

  const activeCount = codeBlocks.filter(codeBlock => codeBlock.active).length;
  const totalCount = codeBlocks.length;
  return totalCount === activeCount ? `(${totalCount})` : `(${activeCount}/${totalCount})`;
};

export default observer(PromptCodeBlocksCounter) as typeof PromptCodeBlocksCounter;
