import * as React from "react";
import style from "./LoreBooksList.module.scss";
import { observer } from "mobx-react-lite";
import { loreBookManager } from "src/store/LoreBookManager.ts";
import LoreBooksListItem from "../LoreBooksListItem";

type Props = Record<string, never>;

const LoreBooksList: React.FC<Props> = () => {
  return (
    <div className={style.container}>
      {loreBookManager.fullList.map(loreBook => <LoreBooksListItem key={loreBook.id} loreBook={loreBook} />)}
    </div>
  );
};

export default observer(LoreBooksList) as typeof LoreBooksList;
