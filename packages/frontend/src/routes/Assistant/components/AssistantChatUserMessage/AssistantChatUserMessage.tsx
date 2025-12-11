import * as React from "react";
import style from "./AssistantChatUserMessage.module.scss";
import { AssistantMessageController } from "src/routes/Assistant/helpers/AssistantMessageController.ts";
import AssistantChatMessageContent
  from "src/routes/Assistant/components/AssistantChatMessageContent/AssistantChatMessageContent.tsx";
import AssistantChatMessageActions
  from "src/routes/Assistant/components/AssistantChatMessageActions/AssistantChatMessageActions.tsx";
import { observer } from "mobx-react-lite";
import clsx from "clsx";

type Props = {
  assistantMessage: AssistantMessageController
};

const AssistantChatUserMessage: React.FC<Props> = (props) => {
  const { assistantMessage } = props;
  const { editable } = assistantMessage;
  return (
    <div className={clsx(style.container, editable && style.containerEditable)}>
      <div className={style.message}>
        <AssistantChatMessageContent assistantMessage={assistantMessage} />
      </div>
      <AssistantChatMessageActions assistantMessage={assistantMessage} />
    </div>
  );
};

export default observer(AssistantChatUserMessage) as typeof AssistantChatUserMessage;
