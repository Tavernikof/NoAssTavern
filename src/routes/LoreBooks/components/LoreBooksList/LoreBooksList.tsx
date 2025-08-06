import * as React from "react";
import style from "./LoreBooksList.module.scss";
import { observer } from "mobx-react-lite";
import { loreBookManager } from "src/store/LoreBookManager.ts";
import LoreBooksListItem from "../LoreBooksListItem";

type Props = Record<string, never>;

const LoreBooksList: React.FC<Props> = () => {
  const { loreBooks, loreBooksDict } = loreBookManager;

  return (
    <div className={style.container}>
      {loreBooks.map(loreBookId => <LoreBooksListItem key={loreBookId} loreBook={loreBooksDict[loreBookId]} />)}
    </div>
  );
};

export default observer(LoreBooksList) as typeof LoreBooksList;
