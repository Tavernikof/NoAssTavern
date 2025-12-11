import * as React from "react";
import style from "./AssistantMessages.module.scss";
import { useAssistantChatControllerContext } from "src/routes/Assistant/helpers/AssistantChatControllerContext.ts";
import { observer } from "mobx-react-lite";
import { ChatMessageRole } from "src/enums/ChatManagerRole.ts";
import AssistantChatUserMessage
  from "src/routes/Assistant/components/AssistantChatUserMessage/AssistantChatUserMessage.tsx";
import AssistantChatAssistantMessage
  from "src/routes/Assistant/components/AssistantChatAssistantMessage/AssistantChatAssistantMessage.tsx";

type Props = Record<string, never>;

const AssistantMessages: React.FC<Props> = () => {
  const assistantChatController = useAssistantChatControllerContext();

  return (
    <div ref={assistantChatController?.setContainer} className={style.container}>
      <div className={style.content}>
        {assistantChatController.messages?.map(assistantMessage => assistantMessage.role === ChatMessageRole.USER
          ? <AssistantChatUserMessage key={assistantMessage.id} assistantMessage={assistantMessage} />
          : <AssistantChatAssistantMessage key={assistantMessage.id} assistantMessage={assistantMessage} />,
        )}
      </div>
    </div>
  );
};

export default observer(AssistantMessages) as typeof AssistantMessages;
