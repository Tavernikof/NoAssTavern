import * as React from "react";
import style from "./PromptEditor.module.scss";
import { PresetEditor } from "src/components/BlockEditor/helpers/PresetEditor.ts";
import { usePresetEditorControllerContext } from "src/components/PromptEditorModal/helpers/PresetEditorControllerContext.ts";
import BlockEditor from "../../../BlockEditor";
import { ArrowDown, ArrowUp, Trash } from "lucide-react";
import Button from "src/components/Button";

type Props = {
  editor: PresetEditor,
  renderToolbar: () => React.ReactNode
};

const PromptEditor: React.FC<Props> = (props) => {
  const { editor, renderToolbar } = props;
  const controller = usePresetEditorControllerContext();

  const onMoveUp = () => controller.moveUpBlock(editor);
  const onMoveDown = () => controller.moveDownBlock(editor);
  const onRemove = () => controller.removeBlock(editor);

  return (
    <div className={style.container}>
      <div className={style.toolbar}>
        <div className={style.main}>
          {renderToolbar()}
          <Button type="button" onClick={editor.toggleBlock}>toggle block</Button>
        </div>
        <div className={style.aside}>
          <button type="button" className={style.actionButton} onClick={onMoveUp}><ArrowUp /></button>
          <button type="button" className={style.actionButton} onClick={onMoveDown}><ArrowDown /></button>
          <button type="button" className={style.actionButton} onClick={onRemove}><Trash /></button>
        </div>
      </div>

      <BlockEditor editor={editor} />
    </div>
  );
};

export default React.memo(PromptEditor) as typeof PromptEditor;
