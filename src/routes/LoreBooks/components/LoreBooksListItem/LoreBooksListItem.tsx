import * as React from "react";
import style from "./LoreBooksListItem.module.scss";
import { observer } from "mobx-react-lite";
import Tooltip from "src/components/Tooltip/Tooltip.tsx";
import Button from "src/components/Button/Button.tsx";
import { Trash, Copy } from "lucide-react";
import { LoreBook } from "src/store/LoreBook.ts";
import { openLoreBookModal } from "src/components/LoreBookModal";
import { loreBookManager } from "src/store/LoreBookManager.ts";

type Props = {
  loreBook: LoreBook,
};

const LoreBooksListItem: React.FC<Props> = (props) => {
  const { loreBook } = props;

  return (
    <div className={style.container}>
      <button className={style.buttonOverlay} onClick={() => openLoreBookModal({ loreBook })} />
      <div className={style.main}>
        <div className={style.character}>{loreBook.name}</div>
      </div>
      <div className={style.aside}>
        <Button
          size="small"
          onClickCapture={() => openLoreBookModal({ loreBook: loreBook.clone() }).result.then(loreBook => {
            loreBookManager.add(loreBook);
          })}
          iconBefore={Copy}
        />
        <Tooltip
          content={() => (
            <div className={style.tooltip}>
              <div>Delete lorebook?</div>
              <Button size="small" onClickCapture={() => loreBookManager.remove(loreBook)}>
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

export default observer(LoreBooksListItem) as typeof LoreBooksListItem;
