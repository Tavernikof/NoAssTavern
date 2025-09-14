import * as React from "react";
import style from "./ChatMessageExternalBlock.module.scss";
import ChatMessageError from "src/routes/SingleChat/components/ChatMessageError/ChatMessageError.tsx";
import { ExternalBlockEditor } from "src/routes/SingleChat/helpers/ExternalBlockEditor.ts";
import { Editable, Slate } from "slate-react";
import { observer } from "mobx-react-lite";
import MessageActionButton from "src/routes/SingleChat/components/MessageActionButton/MessageActionButton.tsx";
import { Check, Pencil, RefreshCw, Terminal, X } from "lucide-react";
import { useChatMessageContext } from "src/routes/SingleChat/helpers/ChatMessageContext.ts";
import { useLatest } from "react-use";
import { FlowExtraBlock } from "src/storages/FlowsStorage.ts";
import { openRequestModal } from "src/components/RequestModal";

type Props = {
  extraBlock: FlowExtraBlock
};

const ChatMessageExternalBlock: React.FC<Props> = (props) => {
  const { extraBlock } = props;
  const { chatMessage } = useChatMessageContext();
  const message = chatMessage.currentSwipe.prompts[extraBlock.key];

  const [editor, setEditor] = React.useState<ExternalBlockEditor | null>();
  const editorRef = useLatest(editor);

  const onSubmit = () => {
    const editor = editorRef.current;
    if (!editor) return;
    chatMessage.updateExtraBlock(extraBlock.key, editor.getContent());
    setEditor(null);
  };

  const setEditable = (e: React.MouseEvent) => {
    e.preventDefault();
    const editor = new ExternalBlockEditor(message.message ?? "");
    editor.on("submit", () => onSubmit());

    editor.on("cancel", () => {
      setEditor(null);
    });
    setEditor(editor);
  };

  const requestId = message?.requestId;

  return (
    <div id={`${chatMessage.id}-${extraBlock.id}`} className={style.block}>
      <div className={style.title}>{extraBlock.key}</div>
      {editor ? (
        <Slate
          editor={editor.editor}
          initialValue={editor.initialValue}
        >
          <Editable
            renderElement={editor.renderElement}
            onKeyDown={editor.onKeyDown}
            className={style.editor}
          />
        </Slate>
      ) : (
        <div onDoubleClick={setEditable}>
          {message?.message || ""}
        </div>
      )}

      {message?.error && <ChatMessageError>{message.error}</ChatMessageError>}
      <div className={style.actions}>
        {editor ? (
          <>
            <MessageActionButton onClick={() => setEditor(null)} icon={X} />
            <MessageActionButton onClick={onSubmit} icon={Check} />
          </>
        ) : (
          <>
            {requestId && (
              <MessageActionButton onClick={() => openRequestModal({ requestId })} icon={Terminal} />
            )}

            <MessageActionButton
              onClick={() => chatMessage.regenerateExtraBlock(extraBlock.id)}
              icon={RefreshCw}
            />

            <MessageActionButton
              onClick={setEditable}
              icon={Pencil}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default observer(ChatMessageExternalBlock) as typeof ChatMessageExternalBlock;
