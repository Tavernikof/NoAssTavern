import * as React from "react";
import Title from "src/components/Title/Title.tsx";
import style from "./Chats.module.scss";
import Button from "src/components/Button";
import { MessageCirclePlus } from "lucide-react";
import { openChatFormModal } from "src/components/ChatFormModal";
import ChatsList from "src/routes/Chats/components/ChatsList";
import { chatsManager } from "src/store/ChatsManager.ts";
import { useNavigate } from "react-router";
import { Select } from "src/components/Form";
import { observer } from "mobx-react-lite";

const sortingOptions = [
  { label: "Create date", value: "createdAt" },
  { label: "Change date", value: "updatedAt" },
];

type Props = Record<string, never>;

const Chats: React.FC<Props> = () => {
  const navigate = useNavigate();

  return (
    <>
      <Title>Chats</Title>
      <div className={style.head}>
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
        <div className={style.aside}>
          Sort by:
          <Select
            value={sortingOptions.find(o => o.value === chatsManager.sort)}
            onChange={v => chatsManager.setSort((v as typeof sortingOptions[number]).value)}
            options={sortingOptions}
          />
        </div>
      </div>
      <ChatsList />
    </>
  );
};

export default observer(Chats) as typeof Chats;
