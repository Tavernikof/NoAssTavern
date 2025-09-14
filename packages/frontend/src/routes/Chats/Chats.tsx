import * as React from "react";
import Title from "src/components/Title/Title.tsx";
import style from "./Chats.module.scss";
import Button from "src/components/Button";
import { MessageCirclePlus } from "lucide-react";
import { openChatFormModal } from "src/components/ChatFormModal";
import ChatsList from "src/routes/Chats/components/ChatsList";
import { chatsManager } from "src/store/ChatsManager.ts";
import { useNavigate } from "react-router";

type Props = Record<string, never>;

const Chats: React.FC<Props> = () => {
  const navigate = useNavigate();

  return (
    <>
      <Title>Chats</Title>
      <div className={style.actions}>
        <Button
          iconBefore={MessageCirclePlus}
          onClick={() => {
            openChatFormModal({}).result.then(chat => {
              chatsManager.add(chat);
              navigate(`/chats/${chat.id}`);
            });
          }}>
          Create
        </Button>
      </div>
      <ChatsList />
    </>
  );
};

export default React.memo(Chats) as typeof Chats;
