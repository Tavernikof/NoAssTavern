import * as React from "react";
import style from "./ChatCodeBlockLever.module.scss";
import { Checkbox } from "src/components/Form";
import { observer } from "mobx-react-lite";
import Tooltip from "src/components/Tooltip";
import { Code, Pen } from "lucide-react";
import { v4 as uuid } from "uuid";
import { Prompt } from "src/store/Prompt.ts";
import clsx from "clsx";
import MessageActionButton from "src/routes/SingleChat/components/MessageActionButton";
import { openPromptEditorModal } from "src/components/PromptEditorModal";

type Props = {
  prompt: Prompt;
  codeBlockIndex: number;
};

const ChatCodeBlockLever: React.FC<Props> = (props) => {
  const { prompt, codeBlockIndex } = props;
  const promptCodeBlock = prompt.codeBlocks[codeBlockIndex];
  const id = React.useMemo(() => uuid(), []);

  const handleToggle = React.useCallback(() => {
    prompt.toggleCodeBlock(promptCodeBlock);
  }, [prompt, promptCodeBlock]);

  return (
    <label htmlFor={id} className={clsx(style.row, promptCodeBlock.active && style.rowActive)}>
      <Tooltip
        placement="right"
        content={() => (
          <>
            {promptCodeBlock.codeBlock.content
              ? <div className={style.content}>{promptCodeBlock.codeBlock.content}</div>
              : <div className={style.no}>No content</div>
            }
            <MessageActionButton
              icon={Pen}
              onClick={() => openPromptEditorModal({
                prompt,
                initialCodeBlockId: promptCodeBlock.codeBlock.id,
              })}
            />
          </>
        )}>
        {({ elementRef, getReferenceProps }) => (
          <button
            className={style.info}
            ref={elementRef}
            {...getReferenceProps({
              onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();
              },
            })}
          >
            <Code size={16} />
          </button>
        )}
      </Tooltip>

      <span className={style.name}>{promptCodeBlock.codeBlock.name ||
        <span className={style.muted}>No title</span>}</span>

      <span className={style.checkbox}>
        <Checkbox
          id={id}
          checked={promptCodeBlock.active}
          onChange={handleToggle}
        />
      </span>
    </label>
  );
};

export default observer(ChatCodeBlockLever) as typeof ChatCodeBlockLever;