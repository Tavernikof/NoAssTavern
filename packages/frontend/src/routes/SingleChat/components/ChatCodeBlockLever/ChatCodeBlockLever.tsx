import * as React from "react";
import style from "./ChatCodeBlockLever.module.scss";
import { Checkbox } from "src/components/Form";
import { observer } from "mobx-react-lite";
import Tooltip from "src/components/Tooltip";
import { Code, Pen } from "lucide-react";
import { v4 as uuid } from "uuid";
import clsx from "clsx";
import MessageActionButton from "src/routes/SingleChat/components/MessageActionButton";
import { runInAction } from "mobx";

type Props = {
  codeBlock: PromptCodeBlock;
  onEdit: () => any
};

const ChatCodeBlockLever: React.FC<Props> = (props) => {
  const { codeBlock, onEdit } = props;
  const id = React.useMemo(() => uuid(), []);

  const handleToggle = React.useCallback(() => {
    runInAction(() => {
      codeBlock.active = !codeBlock.active;
    });
  }, [codeBlock]);

  return (
    <label htmlFor={id} className={clsx(style.row, codeBlock.active && style.rowActive)}>
      <Tooltip
        placement="right"
        content={() => (
          <>
            {codeBlock.codeBlock.content
              ? <div className={style.content}>{codeBlock.codeBlock.content}</div>
              : <div className={style.no}>No content</div>
            }
            <MessageActionButton
              icon={Pen}
              onClick={onEdit}
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

      <span className={style.name}>{codeBlock.codeBlock.name ||
        <span className={style.muted}>No title</span>}</span>

      <span className={style.checkbox}>
        <Checkbox
          id={id}
          checked={codeBlock.active}
          onChange={handleToggle}
        />
      </span>
    </label>
  );
};

export default observer(ChatCodeBlockLever) as typeof ChatCodeBlockLever;