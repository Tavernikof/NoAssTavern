import * as React from "react";
import style from "./ChatListItem.module.scss";
import { Link } from "react-router";
import { observer } from "mobx-react-lite";
import { chatsManager } from "src/store/ChatsManager.ts";
import dayjs from "dayjs";
import Button from "src/components/Button";
import { Trash } from "lucide-react";
import Tooltip from "src/components/Tooltip";
import { GitBranch } from "lucide-react";
import SegmentedCharacterAvatar from "src/components/SegmentedCharacterAvatar";

type Props = {
  chatId: string;
};

const ChatListItem: React.FC<Props> = (props) => {
  const { chatId } = props;
  const chat = chatsManager.chatsDict[chatId];
  const { name, characters, flow } = chat;
  const charactersItems = React.useMemo(() => characters.map(({ character }) => character), [characters]);
  return (
    <Link key={chatId} to={`/chats/${chatId}`} className={style.container}>
      <div className={style.avatar}>
        <SegmentedCharacterAvatar characters={charactersItems} />
      </div>
      <div className={style.main}>
        <div className={style.character}>{name}</div>
        <div className={style.footer}>
          <div className={style.info}><GitBranch size={16} />{flow?.name ?? "-"}</div>
        </div>
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
