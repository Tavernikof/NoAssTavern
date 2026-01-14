import * as React from "react";
import style from "./CodeBlocksList.module.scss";
import { observer } from "mobx-react-lite";
import { codeBlocksManager } from "src/store/CodeBlocksManager.ts";
import CodeBlocksListItem from "src/routes/Prompts/components/CodeBlocksListItem";

type Props = Record<string, never>;

const CodeBlocksList: React.FC<Props> = () => {
  return (
    <div className={style.container}>
      {codeBlocksManager.fullList?.map(codeBlock => <CodeBlocksListItem key={codeBlock.id} codeBlock={codeBlock} />)}
    </div>
  );
};

export default observer(CodeBlocksList) as typeof CodeBlocksList;
