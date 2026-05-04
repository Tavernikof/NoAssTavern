import * as React from "react";
import style from "./PromptBlockContainer.module.scss";
import { ArrowDown, ArrowUp, Trash } from "lucide-react";
import {
  usePresetEditorControllerContext,
} from "src/components/PromptEditorModal/helpers/PresetEditorControllerContext.ts";
import { PresetEditor } from "src/components/BlockEditor/helpers/PresetEditor.ts";
import { PresetHistoryEditor } from "src/components/BlockEditor/helpers/PresetHistoryEditor.ts";

type Props = React.PropsWithChildren<{
  editor: PresetEditor | PresetHistoryEditor,
  toolbar?: React.ReactNode;
}>;

const PromptBlockContainer: React.FC<Props> = (props) => {
  const { editor, toolbar, children } = props;

  const controller = usePresetEditorControllerContext();

  const onMoveUp = () => controller.moveUpBlock(editor);
  const onMoveDown = () => controller.moveDownBlock(editor);
  const onRemove = () => controller.removeBlock(editor);

  return (
    <div className={style.container}>
      <div className={style.toolbar}>
        <div className={style.main}>
          {toolbar}
        </div>
        <div className={style.aside}>
          <button type="button" className={style.actionButton} onClick={onMoveUp}><ArrowUp /></button>
          <button type="button" className={style.actionButton} onClick={onMoveDown}><ArrowDown /></button>
          <button type="button" className={style.actionButton} onClick={onRemove}><Trash /></button>
        </div>
      </div>

      {children}
    </div>
  );
};

export default React.memo(PromptBlockContainer) as typeof PromptBlockContainer;
