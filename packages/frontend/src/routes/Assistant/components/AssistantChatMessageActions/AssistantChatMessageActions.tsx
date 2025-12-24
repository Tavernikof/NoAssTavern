import * as React from "react";
import style from "./AssistantChatMessageActions.module.scss";
import MessageActionButton from "src/routes/SingleChat/components/MessageActionButton/MessageActionButton.tsx";
import { ArrowDownFromLine, Check, ChevronLeft, ChevronRight, Pen, Trash, X, Send } from "lucide-react";
import Tooltip from "src/components/Tooltip/Tooltip.tsx";
import Button from "src/components/Button/Button.tsx";
import { AssistantMessageController } from "src/routes/Assistant/helpers/AssistantMessageController.ts";
import { observer } from "mobx-react-lite";

type Props = {
  assistantMessage: AssistantMessageController
};

const AssistantChatMessageActions: React.FC<Props> = (props) => {
  const { assistantMessage } = props;
  const { editable, activeSwipe, swipes, isLast } = assistantMessage;

  return (
    <div className={style.actions}>
      {editable
        ? (
          <>
            <div className={style.actionsMain}>
              <MessageActionButton onClick={() => assistantMessage.setEditable(false)} icon={X} />
              <MessageActionButton
                onClick={() => assistantMessage.updateMessageFromEditor()}
                icon={Check}
              />
            </div>
            {isLast && (
              <div className={style.actionsAside}>
                <MessageActionButton
                  onClick={() => assistantMessage.submitMessageFromEditor()}
                  icon={Send}
                />
              </div>
            )}
          </>
        ) : (
          <>
            <div className={style.actionsMain}>
              <MessageActionButton icon={Pen} onClick={() => assistantMessage.setEditable(true)} />
              <Tooltip
                content={() => (
                  <div className={style.delete}>
                    <Button onClick={() => assistantMessage.deleteMessage()}>Current message</Button>
                    <Button onClick={() => assistantMessage.deleteMessagesAfter()} iconBefore={ArrowDownFromLine}>
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
            </div>
            <div className={style.actionsAside}>
              {activeSwipe > 0 && (
                <MessageActionButton onClick={() => assistantMessage.changeSwipe()} icon={ChevronLeft} />
              )}
              {swipes.length > 1 && (
                <div className={style.swipe}>
                  {activeSwipe + 1} / {swipes.length}
                </div>
              )}
              <MessageActionButton onClick={() => assistantMessage.changeSwipe(true)} icon={ChevronRight} />
            </div>
          </>
        )
      }
    </div>
  );
};

export default observer(AssistantChatMessageActions) as typeof AssistantChatMessageActions;
