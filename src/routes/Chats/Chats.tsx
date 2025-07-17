import * as React from "react";
import Title from "src/components/Title/Title.tsx";
import style from "./Chats.module.scss";
import Button from "src/components/Button";
import { MessageCirclePlus } from "lucide-react";
import { openChatFormModal } from "src/components/ChatFormModal";
import ChatsList from "src/routes/Chats/components/ChatsList";

type Props = Record<string, never>;

const Chats: React.FC<Props> = () => {

  return (
    <>
      <Title>Chats</Title>
      <div className={style.actions}>
        <Button iconBefore={MessageCirclePlus} onClick={() => openChatFormModal({})}>
          Create
        </Button>
      </div>
      <ChatsList />
    </>
  );
};

export default React.memo(Chats) as typeof Chats;
