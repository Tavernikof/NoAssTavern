import * as React from "react";
import { observer } from "mobx-react-lite";
import PromptCodeBlocksList from "../PromptCodeBlocksList";
import { usePresetEditorControllerContext } from "../../helpers/PresetEditorControllerContext.ts";
import PromptCodeBlock from "../PromptCodeBlock";

type Props = Record<string, never>;

const PromptCodeBlocks: React.FC<Props> = () => {
  const controller = usePresetEditorControllerContext();
  const { selectedCodeBlock } = controller;

  if (selectedCodeBlock) return (
    <PromptCodeBlock
      promptCodeBlock={selectedCodeBlock}
      onBack={() => controller.selectCodeBlock(null)}
    />
  );
  return <PromptCodeBlocksList />;
};

export default observer(PromptCodeBlocks) as typeof PromptCodeBlocks;
