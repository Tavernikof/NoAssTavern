import * as React from "react";
import style from "./PromptCodeBlocksList.module.scss";
import Button from "src/components/Button/Button.tsx";
import { Plus, Trash, ArrowUp, ArrowDown } from "lucide-react";
import { Checkbox, Select } from "src/components/Form";
import { observer } from "mobx-react-lite";
import { usePresetEditorControllerContext } from "../../helpers/PresetEditorControllerContext.ts";
import MessageActionButton from "src/routes/SingleChat/components/MessageActionButton";
import { codeBlocksManager } from "src/store/CodeBlocksManager.ts";

type Props = Record<string, never>;

const PromptCodeBlocksList: React.FC<Props> = () => {
  const controller = usePresetEditorControllerContext();
  const { codeBlocks } = controller;

  return (
    <div className={style.container}>
      <div className={style.head}>
        <Button
          type="button"
          onClick={() => controller.addCodeBlock()}
          iconBefore={Plus}
        >
          Add code block
        </Button>

        <div className={style.import}>
          <Select
            placeholder="Import code block..."
            options={React.useMemo(() => codeBlocksManager.fullList?.map(item => ({
              label: item.name,
              value: item.id,
            })), [codeBlocksManager.fullList])}
            value={null}
            onChange={(option) => {
              const { value } = option as { value: string };
              const codeBlock = codeBlocksManager.dict[value];
              if (!codeBlock) return;
              controller.cloneCodeBlock(codeBlock);
            }}
          />
        </div>
      </div>
      {codeBlocks.map((codeBlock, index) => (
        <div key={index} className={style.block}>
          <div className={style.blockRow}>
            <div className={style.blockActive}>
              <Checkbox
                checked={codeBlock.active}
                onChange={(e) => {
                  codeBlock.setActive(e.currentTarget.checked);
                }}
              />
              <MessageActionButton icon={ArrowUp} onClick={() => controller.moveUpCodeBlock(codeBlock)} />
              <MessageActionButton icon={ArrowDown} onClick={() => controller.moveDownCodeBlock(codeBlock)} />
            </div>

            <div className={style.blockTitle}>
              {codeBlock.name || <span className={style.muted}>No title</span>}
            </div>

            <div className={style.blockActions}>
              <Button type="button" iconBefore={Trash} onClick={() => controller.removeCodeBlock(codeBlock)} />
            </div>
          </div>

          <button
            type="button"
            className={style.blockOverlay}
            onClick={() => controller.selectCodeBlock(codeBlock)} />
        </div>
      ))}
    </div>
  );
};

export default observer(PromptCodeBlocksList) as typeof PromptCodeBlocksList;
