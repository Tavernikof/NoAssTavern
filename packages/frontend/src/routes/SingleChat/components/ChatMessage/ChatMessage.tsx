import * as React from "react";
import clsx from "clsx";
import FormattedMessage from "../FormattedMessage";
import MessageActions from "../MessageActions";
import { observer } from "mobx-react-lite";
import EditableMessage from "../EditableMessage";
import { ChatMessageContext, ChatMessageContextType } from "../../helpers/ChatMessageContext.ts";
import style from "./ChatMessage.module.scss";
import { MessageController } from "../../helpers/MessageController.ts";
import ChatMessageExternalBlocks from "../ChatMessageExternalBlocks";
import ChatMessageError from "../ChatMessageError";
import { reaction } from "mobx";

type Props = {
  chatMessage: MessageController
};

const ChatMessage: React.FC<Props> = (props) => {
  const { chatMessage } = props;
  const { id, pending, editable, showTranslate, message, translate, isAssistant } = chatMessage;
  const elementRef = React.useRef<HTMLDivElement | null>(null);

  const context = React.useMemo<ChatMessageContextType>(() => ({ chatMessage }), [chatMessage]);

  React.useEffect(() => {
    return reaction(() => chatMessage.message.message, () => {
      requestAnimationFrame(() => {
        elementRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
      });
    });
  }, [chatMessage]);

  return (
    <ChatMessageContext.Provider value={context}>
      <div
        ref={elementRef}
        id={id}
        className={clsx(
          style.container,
          // role === "assistant" && style.containerAssistant,
          // role === "user" && style.containerUser,
          pending && style.containerPending,
          editable && style.containerEditable,
          // focused && style.selected,
        )}
      >
        <div
          className={style.content}
          onDoubleClick={(e) => {
            e.preventDefault();
            chatMessage.setEditable(true);
          }}
        >
          {editable
            ? <EditableMessage />
            : <FormattedMessage />
          }
        </div>

        {message.error && <ChatMessageError>{message.error}</ChatMessageError>}
        {showTranslate && translate.error && (
          <ChatMessageError><b>Translate error:</b><br />{translate.error}</ChatMessageError>
        )}

        <MessageActions />

        {isAssistant && <ChatMessageExternalBlocks />}
      </div>
    </ChatMessageContext.Provider>
  );
};

export default observer(ChatMessage) as typeof ChatMessage;
