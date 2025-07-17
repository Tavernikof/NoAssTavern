import * as React from "react";
import style from "./MessageActions.module.scss";
import {
  BotMessageSquare,
  ChevronLeft,
  ChevronRight,
  Languages,
  Send,
  Trash,
  Check,
  X,
  Terminal,
  Pencil,
  ArrowDownFromLine,
} from "lucide-react";
import { observer } from "mobx-react-lite";
import MessageActionButton from "../MessageActionButton";
import { useChatMessageContext } from "src/routes/SingleChat/helpers/ChatMessageContext.ts";
import { useChatControllerContext } from "src/routes/SingleChat/helpers/ChatControllerContext.ts";
import { openRequestModal } from "src/components/RequestModal";
import Tooltip from "src/components/Tooltip";
import Button from "src/components/Button";

type Props = Record<string, never>;

const MessageActions: React.FC<Props> = () => {
  const chatController = useChatControllerContext();
  const { chatMessage } = useChatMessageContext();
  const {
    id,
    pending,
    swipes,
    activeSwipe,
    editable,
    isAssistant,
    isFirst,
    isLast,
    showTranslate,
    message: { requestId },
  } = chatMessage;

  return (
    <div className={style.container}>
      {isAssistant && (
        <div className={style.left}>
          <>
            <div title="Assistant turn" className={style.role}><BotMessageSquare className={style.roleIcon} /></div>
            {requestId && (
              <MessageActionButton onClick={() => openRequestModal({ requestId })} icon={Terminal} />
            )}
          </>
        </div>
      )}

      {!pending && (
        <div className={style.right} contentEditable={false}>
          {editable
            ? ((isLast && !isAssistant)
                ? (
                  <>
                    <MessageActionButton onClick={() => chatController.deleteMessage(id)} icon={Trash} />
                    <MessageActionButton onClick={() => chatMessage.submit()} icon={Send} />
                  </>
                )
                : (
                  <>
                    <MessageActionButton onClick={() => chatMessage.setEditable(false)} icon={X} />
                    <MessageActionButton onClick={() => chatMessage.updateMessageFromEditor()} icon={Check} />
                  </>
                )
            ) : (
              <>
                {isAssistant && (
                  <>
                    {activeSwipe > 0 && (
                      <MessageActionButton onClick={() => chatMessage.changeSwipe()} icon={ChevronLeft} />
                    )}
                    {swipes.length > 1 && (
                      <div className={style.swipe}>
                        {activeSwipe + 1} / {swipes.length}
                      </div>
                    )}
                    {(!isFirst || activeSwipe < swipes.length - 1) && (
                      <MessageActionButton onClick={() => chatMessage.changeSwipe(true)} icon={ChevronRight} />
                    )}
                  </>
                )}

                <MessageActionButton
                  onClick={() => chatMessage.setEditable(true)}
                  icon={Pencil}
                />

                <MessageActionButton
                  active={showTranslate}
                  onClick={() => chatMessage.toggleTranslate()}
                  icon={Languages}
                />

                {!isFirst && (
                  <Tooltip
                    content={() => (
                      <div className={style.delete}>
                        <Button onClick={() => chatController.deleteMessage(id)}>Current message</Button>
                        <Button onClick={() => chatController.deleteMessagesAfter(id)} iconBefore={ArrowDownFromLine}>
                          Current + all below
                        </Button>
                      </div>
                    )}>
                    {({ getReferenceProps, elementRef }) => (
                      <MessageActionButton
                        ref={elementRef}
                        icon={Trash}
                        {...getReferenceProps()}
                      />
                    )}
                  </Tooltip>
                )}

                {isLast && (
                  <MessageActionButton
                    onClick={() => chatMessage.submit()}
                    icon={Send}
                  />
                )}
              </>
            )}
        </div>
      )}
    </div>
  );
};

export default observer(MessageActions) as typeof MessageActions;
