import * as React from "react";
import style from "./AssistantChatHead.module.scss";
import { useAssistantChatControllerContext } from "src/routes/Assistant/helpers/AssistantChatControllerContext.ts";
import MessageActionButton from "src/routes/SingleChat/components/MessageActionButton";
import { Trash } from "lucide-react";
import Button from "src/components/Button/Button.tsx";
import Tooltip from "src/components/Tooltip";
import { useNavigate } from "react-router";
import { observer } from "mobx-react-lite";

type Props = Record<string, never>;

const AssistantChatHead: React.FC<Props> = () => {
  const assistantChatController = useAssistantChatControllerContext();
  const navigate = useNavigate();

  return (
    <div className={style.container}>
      <div className={style.content}>
        <div className={style.info}>
          <Button onClick={() => assistantChatController.openSettings()}>Open settings</Button>
        </div>
        {assistantChatController.assistantChat && (
          <div className={style.actions}>
            <Tooltip
              content={() => (
                <div className={style.tooltip}>
                  <div>Delete chat?</div>
                  <Button
                    size="small"
                    onClickCapture={() => {
                      assistantChatController.removeCurrentChat().then(() => {
                        navigate("/assistant/");
                      });
                    }}
                  >
                    Delete
                  </Button>
                </div>
              )}
            >
              {({ getReferenceProps, elementRef }) => (
                <MessageActionButton ref={elementRef} icon={Trash} {...getReferenceProps()} />
              )}
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
};

export default observer(AssistantChatHead) as typeof AssistantChatHead;
