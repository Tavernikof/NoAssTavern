import * as React from "react";
import style from "./PromptsListItem.module.scss";
import { observer } from "mobx-react-lite";
import { openPromptEditorModal } from "src/components/PromptEditorModal";
import Tooltip from "src/components/Tooltip/Tooltip.tsx";
import Button from "src/components/Button/Button.tsx";
import { Trash, Copy } from "lucide-react";
import { promptsManager } from "src/store/PromptsManager.ts";
import { Prompt } from "src/store/Prompt.ts";

type Props = {
  prompt: Prompt
};

const PromptsListItem: React.FC<Props> = (props) => {
  const { prompt } = props;

  return (
    <div className={style.container}>
      <button className={style.buttonOverlay} onClick={() => openPromptEditorModal({ prompt })} />
      <div className={style.main}>
        <div className={style.character}>{prompt.name}</div>
      </div>
      <div className={style.aside}>
        <Button
          size="small"
          onClickCapture={() => openPromptEditorModal({ prompt: prompt.clone() }).result.then(prompt => {
            promptsManager.add(prompt);
          })}
          iconBefore={Copy}
        />
        <Tooltip
          content={() => (
            <div className={style.tooltip}>
              <div>Delete prompt?</div>
              <Button size="small" onClickCapture={() => promptsManager.remove(prompt)}>
                Delete
              </Button>
            </div>
          )}
        >
          {({ getReferenceProps, elementRef }) => (
            <Button
              ref={elementRef}
              type="button"
              iconBefore={Trash}
              {...getReferenceProps({
                onClick: (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                },
              })}
            />
          )}
        </Tooltip>
      </div>
    </div>
  );
};

export default observer(PromptsListItem) as typeof PromptsListItem;
