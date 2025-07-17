import * as React from "react";
import style from "./ChatListItem.module.scss";
import { Link } from "react-router";
import { observer } from "mobx-react-lite";
import { chatsManager } from "src/store/ChatsManager.ts";
import { personasManager } from "src/store/PersonasManager.ts";
import { charactersManager } from "src/store/CharactersManager.ts";
import dayjs from "dayjs";
import Button from "src/components/Button";
import { Trash } from "lucide-react";
import Tooltip from "src/components/Tooltip";
import { flowsManager } from "src/store/FlowsManager.ts";
import { VenetianMask, GitBranch } from "lucide-react";
import CharacterAvatar from "src/components/CharacterAvatar";
import ErrorMessage from "src/components/ErrorMessage";

type Props = {
  chatId: string;
};

const ChatListItem: React.FC<Props> = (props) => {
  const { chatId } = props;
  const chat = chatsManager.chatsDict[chatId];
  const persona = personasManager.personasDict?.[chat.personId];
  const character = charactersManager.charactersDict?.[chat.characterId];
  const flow = flowsManager.flowsDict?.[chat.flowId];

  return (
    <Link key={chatId} to={`/chats/${chatId}`} className={style.container}>
      <div className={style.avatar}>
        <CharacterAvatar name={character?.name} image={character?.image} size={40} />
      </div>
      <div className={style.main}>
        <div className={style.character}>{character?.name}</div>
        <div className={style.footer}>
          <div className={style.info}><VenetianMask size={16} />{persona?.name ?? "-"}</div>
          <div className={style.info}><GitBranch size={16} />{flow?.name ?? "-"}</div>
        </div>
        {!character && <ErrorMessage>Character not found</ErrorMessage>}
        {!persona && <ErrorMessage>Persona not found</ErrorMessage>}
        {!flow && <ErrorMessage>Flow not found</ErrorMessage>}
      </div>
      <div className={style.aside}>
        <div className={style.date}>
          {dayjs(chat.createdAt).format("YYYY-MM-DD HH:mm:ss")}
        </div>
        <Tooltip
          content={() => (
            <div className={style.tooltip}>
              <div>Delete chat?</div>
              <Button size="small" onClickCapture={() => chatsManager.remove(chat)}>
                Delete
              </Button>
            </div>
          )}
        >
          {({ getReferenceProps, elementRef }) => (
            <Button
              ref={elementRef}
              type="button"
              iconBefore={Trash}
              {...getReferenceProps({
                onClick: (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                },
              })}
            />
          )}
        </Tooltip>
      </div>
    </Link>
  );
};

export default observer(ChatListItem) as typeof ChatListItem;
