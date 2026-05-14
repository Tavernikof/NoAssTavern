import * as React from "react";
import style from "./PromptEditorAddBlock.module.scss";
import { usePromptEditorControllerContext } from "src/components/PromptEditorModal/helpers/PromptEditorControllerContext.ts";
import Button from "src/components/Button";
import { Plus } from "lucide-react";

type Props = Record<string, never>;

const PromptEditorAddBlock: React.FC<Props> = () => {
  const controller = usePromptEditorControllerContext();

  const onAddBlock = () => controller.addBlock();
  const onAddHistory = () => controller.addHistory();

  return (
    <div className={style.container}>
      <Button type="button" onClick={onAddBlock} iconBefore={Plus}>Add block</Button>
      <Button type="button" onClick={onAddHistory} iconBefore={Plus}>Add history</Button>
    </div>
  );
};

export default React.memo(PromptEditorAddBlock) as typeof PromptEditorAddBlock;
