import * as React from "react";
import { AssistantMessageController } from "src/routes/Assistant/helpers/AssistantMessageController.ts";
import { observer } from "mobx-react-lite";
import clsx from "clsx";
import ChatMessageError from "src/routes/SingleChat/components/ChatMessageError/ChatMessageError.tsx";
import style from "./AssistantChatAssistantMessage.module.scss";
import AssistantChatMessageContent from "src/routes/Assistant/components/AssistantChatMessageContent";
import AssistantChatMessageActions from "src/routes/Assistant/components/AssistantChatMessageActions";

type Props = {
  assistantMessage: AssistantMessageController
};

const AssistantChatAssistantMessage: React.FC<Props> = (props) => {
  const { assistantMessage } = props;
  const { pending, message } = assistantMessage;

  return (
    <div className={clsx(style.container, pending && style.containerPending)}>
      <AssistantChatMessageContent assistantMessage={assistantMessage} />

      {message.error && <ChatMessageError>{message.error}</ChatMessageError>}
      <AssistantChatMessageActions assistantMessage={assistantMessage} />
    </div>
  );
};

export default observer(AssistantChatAssistantMessage) as typeof AssistantChatAssistantMessage;
