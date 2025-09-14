import * as React from "react";
import style from "./PromptEditorAddBlock.module.scss";
import { usePresetEditorControllerContext } from "src/components/CodeEditor/helpers/PresetEditorControllerContext.ts";
import Button from "src/components/Button";
import { Plus } from "lucide-react";

type Props = Record<string, never>;

const PromptEditorAddBlock: React.FC<Props> = () => {
  const controller = usePresetEditorControllerContext();

  const onAdd = () => controller.addBlock();

  return (
    <div className={style.container}>
      <Button type="button" onClick={onAdd} iconBefore={Plus}>Add block</Button>
    </div>
  );
};

export default React.memo(PromptEditorAddBlock) as typeof PromptEditorAddBlock;
