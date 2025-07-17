import * as React from "react";
import style from "./ChatLevers.module.scss";
import { useChatControllerContext } from "src/routes/SingleChat/helpers/ChatControllerContext.ts";
import { observer } from "mobx-react-lite";
import ChatLever from "src/routes/SingleChat/components/ChatLever";
import MessageActionButton from "src/routes/SingleChat/components/MessageActionButton";
import { Pen } from "lucide-react";
import { openPromptEditorModal } from "src/components/PromptEditorModal";

type Props = Record<string, never>;

const ChatLevers: React.FC<Props> = () => {
  const { flow } = useChatControllerContext();
  if (!flow) return null;
  return (
    <div className={style.container}>
      {flow.prompts.map(prompt => {
        if (!prompt.levers.length) return null;
        return (
          <div className={style.block} id={`prompt-${prompt.id}`} key={prompt.id}>
            <div className={style.head}>
              <div className={style.title}>{prompt.name}</div>
              <MessageActionButton icon={Pen} onClick={() => openPromptEditorModal({ prompt })} />
            </div>
            {prompt.levers.map((lever, i) => <ChatLever key={i} prompt={prompt} lever={lever} />)}
          </div>
        );
      })}
    </div>
  );
};

export default observer(ChatLevers) as typeof ChatLevers;
