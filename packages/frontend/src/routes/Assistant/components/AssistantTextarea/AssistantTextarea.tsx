import * as React from "react";
import style from "./AssistantTextarea.module.scss";
import { ArrowUp, Square } from "lucide-react";
import { Textarea } from "src/components/Form";
import { useAssistantChatControllerContext } from "src/routes/Assistant/helpers/AssistantChatControllerContext.ts";
import { observer } from "mobx-react-lite";

type Props = Record<string, never>;

const AssistantTextarea: React.FC<Props> = () => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const assistantChatController = useAssistantChatControllerContext();

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

  React.useEffect(() => {
    textareaRef.current?.focus();
  }, [assistantChatController]);

  return (
    <div className={style.container}>
      <Textarea
        ref={textareaRef}
        autoHeight
        className={style.input}
        placeholder="Send a message"
        disabled={assistantChatController.someMessagePending}
        onKeyDown={(event) => {
          if (event.key === "Enter" && event.metaKey) {
            event.preventDefault();
            event.stopPropagation();
            onSubmit();
          }
        }}
      />
      {
        assistantChatController.someMessagePending
          ? <button className={style.submitButton} onClick={onCancel}><Square /></button>
          : <button className={style.submitButton} onClick={onSubmit}><ArrowUp /></button>
      }

    </div>
  );
};

export default observer(AssistantTextarea) as typeof AssistantTextarea;
