import * as React from "react";
import style from "./PromptsList.module.scss";
import { observer } from "mobx-react-lite";
import PromptsListItem from "../PromptsListItem";
import { promptsManager } from "src/store/PromptsManager.ts";

type Props = Record<string, never>;

const PromptsList: React.FC<Props> = () => {
  return (
    <div className={style.container}>
      {promptsManager.fullList.map(prompt => <PromptsListItem key={prompt.id} prompt={prompt} />)}
    </div>
  );
};

export default observer(PromptsList) as typeof PromptsList;
