import * as React from "react";
import style from "./PromptsList.module.scss";
import { observer } from "mobx-react-lite";
import PromptsListItem from "../PromptsListItem";
import { promptsManager } from "src/store/PromptsManager.ts";

type Props = Record<string, never>;

const PromptsList: React.FC<Props> = () => {
  const { prompts, promptsDict } = promptsManager;

  return (
    <div className={style.container}>
      {prompts.map(promptId => <PromptsListItem key={promptId} prompt={promptsDict[promptId]} />)}
    </div>
  );
};

export default observer(PromptsList) as typeof PromptsList;
