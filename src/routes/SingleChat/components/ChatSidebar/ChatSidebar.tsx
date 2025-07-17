import * as React from "react";
import style from "./ChatSidebar.module.scss";
import { Link } from "react-router";
import { ChevronLeft, User, VenetianMask, GitBranch, Ban } from "lucide-react";
import Button from "src/components/Button";
import { openCharacterModal } from "src/components/CharacterModal";
import { useChatControllerContext } from "src/routes/SingleChat/helpers/ChatControllerContext.ts";
import { observer } from "mobx-react-lite";
import { openPersonaModal } from "src/components/PersonaModal";
import ChatLevers from "src/routes/SingleChat/components/ChatLevers";
import { openFlowEditorModal } from "src/components/FlowEditorModal";
import ErrorMessage from "src/components/ErrorMessage";

type Props = Record<string, never>;

const ChatSidebar: React.FC<Props> = () => {
  const { character, persona, flow } = useChatControllerContext();

  return (
    <div className={style.container}>
      <Link to="/chats" className={style.back}>
        <ChevronLeft />
        Back
      </Link>
      <div className={style.actions}>
        <div>
          <Button iconBefore={User} onClick={() => openCharacterModal({ character })} disabled={!character} block>
            Character
          </Button>
          {!character && <ErrorMessage>Character not found</ErrorMessage>}
        </div>

        <div>
          <Button iconBefore={VenetianMask} onClick={() => openPersonaModal({ persona })} disabled={!persona} block>
            Persona
          </Button>
          {!persona && <ErrorMessage>Persona not found</ErrorMessage>}
        </div>

        <div>
          <Button
            iconBefore={GitBranch}
            block
            onClick={() => flow ? openFlowEditorModal({ flow: flow }) : null}
            disabled={!flow}
          >
            Flow
          </Button>
          {!flow && <ErrorMessage>Flow not found</ErrorMessage>}
        </div>
      </div>
      <ChatLevers />
      {flow?.isProcess && (
        <div className={style.footer}>
          <Button onClick={() => flow.stop()} block iconBefore={Ban}>Cancel generate</Button>
        </div>
      )}
    </div>
  );
};

export default observer(ChatSidebar) as typeof ChatSidebar;
