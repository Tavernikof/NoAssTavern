import * as React from "react";
import { observer } from "mobx-react-lite";
import Title from "src/components/Title";
import style from "./LoreBooks.module.scss";
import { BookPlus } from "lucide-react";
import Button from "src/components/Button";
import { openLoreBookModal } from "src/components/LoreBookModal";
import { LoreBook } from "src/store/LoreBook.ts";
import { loreBookManager } from "src/store/LoreBookManager.ts";
import LoreBooksList from "./components/LoreBooksList";
import ImportButton from "src/components/ImportButton";

type Props = Record<string, never>;

const LoreBooks: React.FC<Props> = () => {
  return (
    <>
      <Title>Lorebooks</Title>
      <div className={style.actions}>
        <Button
          iconBefore={BookPlus}
          onClick={() => {
            openLoreBookModal({ loreBook: LoreBook.createEmpty() }).result.then(loreBook => {
              loreBookManager.add(loreBook);
            });
          }}>
          Create
        </Button>
        <ImportButton onUpload={loreBookManager.import} text="Import" />
      </div>
      <LoreBooksList />
    </>
  );
};

export default observer(LoreBooks) as typeof LoreBooks;
