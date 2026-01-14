import * as React from "react";
import style from "./ChatLever.module.scss";
import { Checkbox } from "src/components/Form";
import { observer } from "mobx-react-lite";
import Tooltip from "src/components/Tooltip";
import { Info } from "lucide-react";
import { v4 as uuid } from "uuid";
import { Prompt } from "src/store/Prompt.ts";
import clsx from "clsx";

type Props = {
  prompt: Prompt;
  lever: [number, number];
};

const ChatLever: React.FC<Props> = (props) => {
  const { prompt, lever } = props;
  const block = prompt.blocks[lever[0]].content[lever[1]];
  const id = React.useMemo(() => uuid(), []);

  return (
    <label htmlFor={id} className={clsx(style.row, block.active && style.rowActive)}>
      <Tooltip
        placement="right"
        content={() => (
          block.content
            ? <div className={style.content}>{block.content}</div>
            : <div className={style.no}>No content</div>
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
            <Info size={16} />
          </button>
        )}
      </Tooltip>

      <span className={style.name}>{block.name}</span>

      <span className={style.checkbox}>
        <Checkbox
          id={id}
          checked={block.active}
          onChange={() => prompt.toggleBlockContent(block)}
        />
      </span>
    </label>

  );
};

export default observer(ChatLever) as typeof ChatLever;
