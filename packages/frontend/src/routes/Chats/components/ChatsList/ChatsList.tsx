import * as React from "react";
import style from "./ChatsList.module.scss";
import { observer } from "mobx-react-lite";
import { chatsManager } from "src/store/ChatsManager.ts";
import ChatListItem from "src/routes/Chats/components/ChatListItem";

type Props = Record<string, never>;

const ChatsList: React.FC<Props> = () => {
  return (
    <div className={style.container}>
      {chatsManager.list.map(chatId => <ChatListItem key={chatId} chatId={chatId} />)}
    </div>
  );
};

export default observer(ChatsList) as typeof ChatsList;
