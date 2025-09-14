import * as React from "react";
import style from "./FlowsList.module.scss";
import { observer } from "mobx-react-lite";
import { flowsManager } from "src/store/FlowsManager.ts";
import FlowsListItem from "src/routes/Flows/components/FlowsListItem";

type Props = Record<string, never>;

const FlowsList: React.FC<Props> = () => {
  return (
    <div className={style.container}>
      {flowsManager.fullList.map(flow => <FlowsListItem key={flow.id} flow={flow} />)}
    </div>
  );
};

export default observer(FlowsList) as typeof FlowsList;
