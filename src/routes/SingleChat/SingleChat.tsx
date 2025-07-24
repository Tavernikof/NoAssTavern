import * as React from "react";
import { useParams } from "react-router";
import { useChatController } from "src/helpers/useChatController.ts";
import { ChatControllerContext } from "src/routes/SingleChat/helpers/ChatControllerContext.ts";
import ChatMessages from "src/routes/SingleChat/components/ChatMessages";
import ChatSidebar from "src/routes/SingleChat/components/ChatSidebar";
import style from "./SingleChat.module.scss";
import { observer } from "mobx-react-lite";

type Props = Record<string, never>;

const SingleChat: React.FC<Props> = () => {
  const { chatId } = useParams<{ chatId: string }>();

  const chatController = useChatController(chatId);
  if (!chatController) return null;

  if (!chatController.chat) return <div>Chat not found</div>;
  return (
    <ChatControllerContext.Provider value={chatController}>
      <div className={style.container}>
        <ChatSidebar />
        <ChatMessages />
      </div>
    </ChatControllerContext.Provider>
  );
};

export default observer(SingleChat) as typeof SingleChat;
