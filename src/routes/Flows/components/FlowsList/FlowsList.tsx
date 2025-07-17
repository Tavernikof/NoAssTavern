import * as React from "react";
import style from "./FlowsList.module.scss";
import { observer } from "mobx-react-lite";
import { flowsManager } from "src/store/FlowsManager.ts";
import FlowsListItem from "src/routes/Flows/components/FlowsListItem";

type Props = Record<string, never>;

const FlowsList: React.FC<Props> = () => {
  const { flows, flowsDict } = flowsManager;

  return (
    <div className={style.container}>
      {flows.map(flowId => <FlowsListItem key={flowId} flow={flowsDict[flowId]} />)}
    </div>
  );
};

export default observer(FlowsList) as typeof FlowsList;
