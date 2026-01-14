import * as React from "react";
import style from "./CodeBlocksListItem.module.scss";
import { observer } from "mobx-react-lite";
import Tooltip from "src/components/Tooltip/Tooltip.tsx";
import Button from "src/components/Button/Button.tsx";
import { Trash, Copy } from "lucide-react";
import { CodeBlock } from "src/store/CodeBlock.ts";
import { openCodeBlockEditorModal } from "src/components/CodeBlockEditorModal";
import { codeBlocksManager } from "src/store/CodeBlocksManager.ts";

type Props = {
  codeBlock: CodeBlock
};

const CodeBlocksListItem: React.FC<Props> = (props) => {
  const { codeBlock } = props;

  return (
    <div className={style.container}>
      <button className={style.buttonOverlay} onClick={() => openCodeBlockEditorModal({ codeBlock })} />
      <div className={style.main}>
        <div className={style.character}>{codeBlock.name}</div>
      </div>
      <div className={style.aside}>
        <Button
          size="small"
          onClickCapture={() => openCodeBlockEditorModal({ codeBlock: codeBlock.clone() }).result.then(codeBlock => {
            codeBlocksManager.add(codeBlock);
          })}
          iconBefore={Copy}
        />
        <Tooltip
          content={() => (
            <div className={style.tooltip}>
              <div>Delete code block?</div>
              <Button size="small" onClickCapture={() => codeBlocksManager.remove(codeBlock)}>
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

export default observer(CodeBlocksListItem) as typeof CodeBlocksListItem;
