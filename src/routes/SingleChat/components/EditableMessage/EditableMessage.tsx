import * as React from "react";
import style from "./EditableMessage.module.scss";
import { Editable, Slate } from "slate-react";
import { renderElement } from "../ElementRenderer";
import { renderLeaf } from "../LeafRenderer";
import { NodeEntry } from "slate";
import { DecoratedRange } from "src/helpers/editorTypes.ts";
import { observer } from "mobx-react-lite";
import { useChatMessageContext } from "src/routes/SingleChat/helpers/ChatMessageContext.ts";

type Props = Record<string, never>;

const EditableMessage: React.FC<Props> = () => {
  const { chatMessage } = useChatMessageContext();
  const { editor } = chatMessage;
  const decoratorsDict = editor?.decoratorsDict;
  const decorate = React.useCallback<(entry: NodeEntry) => DecoratedRange[]>(([node]) => {
    const ranges = "id" in node && decoratorsDict?.[node.id]?.ranges;
    return ranges || [];
  }, [decoratorsDict]);

  if (!editor) return;
  return (
    <Slate
      editor={editor.editor}
      initialValue={editor.initialValue}
      onChange={editor.onChange}
    >
      <Editable
        decorate={decorate}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={editor.onKeyDown}
        className={style.editor}
      />
    </Slate>
  );
};

export default observer(EditableMessage) as typeof EditableMessage;
