import * as React from "react";
import style from "./CodeEditor.module.scss";
import { observer } from "mobx-react-lite";
import { CodeEditorContext } from "src/components/CodeEditor/helpers/CodeEditorContext.ts";
import { Editable, Slate } from "slate-react";
import { PresetEditor } from "src/components/CodeEditor/helpers/PresetEditor.ts";

type Props = {
  editor: PresetEditor,
};

const CodeEditor: React.FC<Props> = (props) => {
  const { editor } = props;

  return (
    <CodeEditorContext.Provider value={editor}>
      <Slate
        editor={editor.editor}
        initialValue={editor.initialValue}
      >
        <Editable
          renderElement={editor.renderElement}
          // renderLeaf={renderLeaf}
          onKeyDown={editor.handleKeyDown}
          className={style.editor}
        />
      </Slate>
    </CodeEditorContext.Provider>
  );
};

export default observer(CodeEditor) as typeof CodeEditor;
