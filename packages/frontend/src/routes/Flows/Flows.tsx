import * as React from "react";
import style from "./Flows.module.scss";
import Title from "src/components/Title";
import Button from "src/components/Button";
import { GitBranchPlus } from "lucide-react";
import FlowsList from "./components/FlowsList";
import { openFlowEditorModal } from "src/components/FlowEditorModal";
import { Flow } from "src/store/Flow.ts";
import { flowsManager } from "src/store/FlowsManager.ts";

type Props = Record<string, never>;

const Flows: React.FC<Props> = () => {

  return (
    <>
      <Title>Flows</Title>
      <div className={style.actions}>
        <Button
          iconBefore={GitBranchPlus}
          onClick={() => {
            openFlowEditorModal({ flow: Flow.createEmpty() }).result.then(flow => {
              flowsManager.add(flow);
            });
          }}
        >
          Create
        </Button>

        <div className={style.aside}>
          <Button onClick={() => flowsManager.importDefault()}>Import default flow</Button>
        </div>
      </div>
      <FlowsList />
    </>
  );
};

export default React.memo(Flows) as typeof Flows;
