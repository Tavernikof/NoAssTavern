import * as React from "react";
import style from "./AssistantChatsListItem.module.scss";
import { Link } from "react-router";
import { assistantChatsManager } from "src/store/AssistantChatsManager.ts";
import { observer } from "mobx-react-lite";
import {
  useAssistantChatControllerContext,
} from "src/routes/Assistant/helpers/AssistantChatControllerContext.ts";
import clsx from "clsx";

type Props = {
  assistantChatId: string
};

const AssistantChatsListItem: React.FC<Props> = (props) => {
  const { assistantChatId } = props;
  const assistantChat = assistantChatsManager.dict[assistantChatId];
  const assistantChatController = useAssistantChatControllerContext();
  const isCurrent = assistantChatId === assistantChatController?.assistantChatId;

  if (!assistantChat) return null;
  return (
    <div className={style.container}>
      <Link
        className={clsx(style.link, isCurrent && style.linkActive)}
        to={`/assistant/${assistantChatId}`}>
        {assistantChat.name}
      </Link>
    </div>
  );
};

export default observer(AssistantChatsListItem) as typeof AssistantChatsListItem;
