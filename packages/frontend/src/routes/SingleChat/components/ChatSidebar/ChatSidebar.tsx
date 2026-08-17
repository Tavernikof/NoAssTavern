import * as React from "react";
import style from "./ChatSidebar.module.scss";
import { Link } from "react-router";
import { ChevronLeft, Ban, BotMessageSquare } from "lucide-react";
import Button from "src/components/Button";
import { useChatControllerContext } from "src/routes/SingleChat/helpers/ChatControllerContext.ts";
import { observer } from "mobx-react-lite";
import ChatLevers from "src/routes/SingleChat/components/ChatLevers";
import ChatMembers from "src/routes/SingleChat/components/ChatMembers";
import { openChatAssistantModal } from "src/routes/SingleChat/components/ChatAssistantModal";

type Props = Record<string, never>;

const ChatSidebar: React.FC<Props> = () => {
  const chatController = useChatControllerContext();
  const { flow } = chatController;

  return (
    <div className={style.container}>
      <Link to="/chats" className={style.back}>
        <ChevronLeft />
        Back
      </Link>

      <div className={style.members}>
        <ChatMembers />
      </div>

      <div className={style.assistant}>
        <Button
          block
          iconBefore={BotMessageSquare}
          onClick={() => openChatAssistantModal({ chatController })}
        >
          Assistant
        </Button>
      </div>

      <ChatLevers />

      {flow?.isProcess && (
        <div className={style.footer}>
          <Button onClick={() => flow.stop()} block iconBefore={Ban}>Cancel generate</Button>
        </div>
      )}
    </div>
  );
};

export default observer(ChatSidebar) as typeof ChatSidebar;
