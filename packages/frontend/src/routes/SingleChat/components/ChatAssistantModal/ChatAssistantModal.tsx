import * as React from "react";
import { observer } from "mobx-react-lite";
import { PlusCircle, Trash } from "lucide-react";
import clsx from "clsx";
import Button from "src/components/Button";
import Tooltip from "src/components/Tooltip";
import MessageActionButton from "src/routes/SingleChat/components/MessageActionButton";
import { ChatController } from "src/routes/SingleChat/helpers/ChatController.ts";
import { AssistantChatController } from "src/routes/Assistant/helpers/AssistantChatController.ts";
import { AssistantChatControllerContext } from "src/routes/Assistant/helpers/AssistantChatControllerContext.ts";
import AssistantMessages from "src/routes/Assistant/components/AssistantMessages";
import AssistantTextarea from "src/routes/Assistant/components/AssistantTextarea";
import style from "./ChatAssistantModal.module.scss";

type Props = {
  chatController: ChatController;
};

const ChatAssistantModal: React.FC<Props> = ({ chatController }) => {
  const [assistantChatController] = React.useState(() => new AssistantChatController({
    parentChatController: chatController,
  }));

  React.useEffect(() => {
    assistantChatController.setup();
    const latestChat = [...chatController.chat.assistantChats]
      .sort((a, b) => +b.createdAt - +a.createdAt)[0];
    assistantChatController.setChatId(latestChat?.id);
    return () => assistantChatController.dispose();
  }, [assistantChatController, chatController]);

  const assistantChats = [...chatController.chat.assistantChats]
    .sort((a, b) => +b.createdAt - +a.createdAt);

  return (
    <AssistantChatControllerContext.Provider value={assistantChatController}>
      <div className={style.container}>
        <aside className={style.sidebar}>
          <Button
            block
            iconBefore={PlusCircle}
            disabled={assistantChatController.someMessagePending}
            onClick={() => assistantChatController.setChatId(null)}
          >
            New Chat
          </Button>

          <div className={style.list}>
            {assistantChats.map(assistantChat => (
              <button
                key={assistantChat.id}
                className={clsx(
                  style.chatButton,
                  assistantChat.id === assistantChatController.assistantChatId && style.chatButtonActive,
                )}
                disabled={assistantChatController.someMessagePending}
                onClick={() => assistantChatController.setChatId(assistantChat.id)}
              >
                {assistantChat.name}
              </button>
            ))}
          </div>
        </aside>

        <main className={style.main}>
          <header className={style.header}>
            <Button onClick={() => assistantChatController.openSettings()}>Open settings</Button>
            {assistantChatController.assistantChat && (
              <Tooltip
                content={() => (
                  <div className={style.deleteTooltip}>
                    <div>Delete chat?</div>
                    <Button size="small" onClick={() => assistantChatController.removeCurrentChat()}>
                      Delete
                    </Button>
                  </div>
                )}
              >
                {({ getReferenceProps, elementRef }) => (
                  <MessageActionButton ref={elementRef} icon={Trash} {...getReferenceProps()} />
                )}
              </Tooltip>
            )}
          </header>
          <AssistantMessages headerOffset={false} />
          <AssistantTextarea />
        </main>
      </div>
    </AssistantChatControllerContext.Provider>
  );
};

export default observer(ChatAssistantModal) as typeof ChatAssistantModal;
