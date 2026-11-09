import * as React from "react";
import style from "./AssistantTextarea.module.scss";
import { ArrowUp, Paperclip, Square } from "lucide-react";
import { Textarea } from "src/components/Form";
import { useAssistantChatControllerContext } from "src/routes/Assistant/helpers/AssistantChatControllerContext.ts";
import { observer } from "mobx-react-lite";
import clsx from "clsx";
import AssistantAttachedFiles from "src/routes/Assistant/components/AssistantAttachedFiles";

type Props = Record<string, never>;

const AssistantTextarea: React.FC<Props> = () => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const assistantChatController = useAssistantChatControllerContext();
  const pending = assistantChatController.someMessagePending;

  const onSubmit = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const value = textarea.value;
    assistantChatController.submitMessage(value);
    textarea.value = "";
    textarea.focus();
    textarea.dispatchEvent(new CustomEvent("input"));
  };

  const onCancel = () => assistantChatController.cancelAllRequests();

  const onPickFiles = () => fileInputRef.current?.click();

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    assistantChatController.addAttachedFiles(files);
    textareaRef.current?.focus();
  };

  const onPaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const files = Array.from(event.clipboardData.files);
    if (!files.length) return;
    event.preventDefault();
    assistantChatController.addAttachedFiles(files);
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (pending || !event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    setDragOver(false);
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    setDragOver(false);
    if (pending) return;
    const files = Array.from(event.dataTransfer.files);
    if (!files.length) return;
    event.preventDefault();
    assistantChatController.addAttachedFiles(files);
  };

  React.useEffect(() => {
    textareaRef.current?.focus();
  }, [assistantChatController]);

  return (
    <div
      className={clsx(style.container, dragOver && style.containerDragOver)}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <AssistantAttachedFiles />
      <div className={style.inputWrapper}>
        <Textarea
          ref={textareaRef}
          autoHeight
          className={style.input}
          placeholder="Send a message"
          disabled={pending}
          onPaste={onPaste}
          onKeyDown={(event) => {
            if (event.key === "Enter" && event.metaKey) {
              event.preventDefault();
              event.stopPropagation();
              onSubmit();
            }
          }}
        />
        <button
          type="button"
          className={style.attachButton}
          onClick={onPickFiles}
          disabled={pending}
          title="Attach files"
        >
          <Paperclip />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className={style.fileInput}
          onChange={onFileChange}
        />
        {
          pending
            ? <button className={style.submitButton} onClick={onCancel}><Square /></button>
            : <button className={style.submitButton} onClick={onSubmit}><ArrowUp /></button>
        }
      </div>
    </div>
  );
};

export default observer(AssistantTextarea) as typeof AssistantTextarea;
