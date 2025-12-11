import * as React from "react";
import style from "./Assistant.module.scss";
import { useParams } from "react-router";
import AssistantSidebar from "src/routes/Assistant/components/AssistantSidebar";
import {
  AssistantChatControllerContext,
  useAssistantChatController,
} from "src/routes/Assistant/helpers/AssistantChatControllerContext.ts";
import AssistantMessages from "src/routes/Assistant/components/AssistantMessages/AssistantMessages.tsx";
import AssistantTextarea from "src/routes/Assistant/components/AssistantTextarea/AssistantTextarea.tsx";
import AssistantChatHead from "src/routes/Assistant/components/AssistantChatHead";

type Props = Record<string, never>;

const Assistant: React.FC<Props> = () => {
  const { chatId } = useParams<{ chatId?: string }>();
  const assistantChatController = useAssistantChatController(chatId);

  if (!assistantChatController) return null;
  return (
    <AssistantChatControllerContext.Provider value={assistantChatController}>
      <div className={style.container}>
        <AssistantSidebar />
        {assistantChatController && (
          <div className={style.main}>
            <AssistantChatHead />
            <AssistantMessages />
            <AssistantTextarea />
          </div>
        )}
      </div>
    </AssistantChatControllerContext.Provider>
  );
};

export default React.memo(Assistant) as typeof Assistant;
