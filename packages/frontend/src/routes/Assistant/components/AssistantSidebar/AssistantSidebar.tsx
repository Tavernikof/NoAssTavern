import * as React from "react";
import style from "./AssistantSidebar.module.scss";
import { Link, useNavigate } from "react-router";
import { ChevronLeft, PlusCircle } from "lucide-react";
import { assistantChatsManager } from "src/store/AssistantChatsManager.ts";
import AssistantChatsListItem from "src/routes/Assistant/components/AssistantChatsListItem";
import Button from "src/components/Button";
import { observer } from "mobx-react-lite";

type Props = Record<string, never>;

const AssistantSidebar: React.FC<Props> = () => {
  const navigate = useNavigate();
  return (
    <div className={style.container}>
      <Link to="/chats" className={style.back}>
        <ChevronLeft />
        Back
      </Link>

      <div className={style.createButton}>
        <Button block iconBefore={PlusCircle} onClick={() => navigate("/assistant")}>New Chat</Button>
      </div>

      <div className={style.list}>
        {assistantChatsManager.list.map(assistantChatId => (
          <AssistantChatsListItem
            key={assistantChatId}
            assistantChatId={assistantChatId}
          />
        ))}
      </div>
    </div>
  );
};

export default observer(AssistantSidebar) as typeof AssistantSidebar;
