import * as React from "react";
import { useChatMessageContext } from "src/routes/SingleChat/helpers/ChatMessageContext.ts";
import style from "./ChatMessageExternalBlocks.module.scss";
import { observer } from "mobx-react-lite";
import ChatMessageExternalBlock from "src/routes/SingleChat/components/ChatMessageExternalBlock";

type Props = Record<string, never>;

const ChatMessageExternalBlocks: React.FC<Props> = () => {
  const { chatMessage } = useChatMessageContext();
  const { chatController: { flow: { extraBlocks } } } = chatMessage;

  return (
    <div className={style.container}>
      {extraBlocks.map(extraBlock => {
        return (
          <ChatMessageExternalBlock
            key={extraBlock.id}
            extraBlock={extraBlock}
          />
        );
      })}
    </div>
  );
};

export default observer(ChatMessageExternalBlocks) as typeof ChatMessageExternalBlocks;
