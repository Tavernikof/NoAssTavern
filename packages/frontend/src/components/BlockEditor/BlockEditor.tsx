import * as React from "react";
import style from "./BlockEditor.module.scss";
import { observer } from "mobx-react-lite";
import { BlockEditorContext } from "src/components/BlockEditor/helpers/BlockEditorContext.ts";
import { Editable, Slate } from "slate-react";
import { PresetEditor } from "src/components/BlockEditor/helpers/PresetEditor.ts";

type Props = {
  editor: PresetEditor,
};

const BlockEditor: React.FC<Props> = (props) => {
  const { editor } = props;

  React.useEffect(() => editor.setInited(), [editor]);

  return (
    <BlockEditorContext.Provider value={editor}>
      <Slate
        editor={editor.editor}
        initialValue={editor.initialValue}
        onChange={editor.handleChange}
      >
        <Editable
          renderElement={editor.renderElement}
          // renderLeaf={renderLeaf}
          onKeyDown={editor.handleKeyDown}
          className={style.editor}
        />
      </Slate>
    </BlockEditorContext.Provider>
  );
};

export default observer(BlockEditor) as typeof BlockEditor;
