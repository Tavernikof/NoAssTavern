import * as React from "react";
import style from "./FlowsListItem.module.scss";
import { observer } from "mobx-react-lite";
import { flowsManager } from "src/store/FlowsManager.ts";
import Tooltip from "src/components/Tooltip/Tooltip.tsx";
import Button from "src/components/Button/Button.tsx";
import { Trash } from "lucide-react";
import { Flow } from "src/store/Flow.ts";
import { openFlowEditorModal } from "src/components/FlowEditorModal";

type Props = {
  flow: Flow
};

const FlowsListItem: React.FC<Props> = (props) => {
  const { flow } = props;

  return (
    <div className={style.container}>
      <button className={style.buttonOverlay} onClick={() => openFlowEditorModal({ flow })} />
      <div className={style.main}>
        <div className={style.character}>{flow.name}</div>
      </div>
      <span className={style.aside}>
         <Tooltip
           content={() => (
             <div className={style.tooltip}>
               <div>Delete flow?</div>
               <Button size="small" onClickCapture={() => flowsManager.remove(flow)}>
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
      </span>
    </div>
  );
};

export default observer(FlowsListItem) as typeof FlowsListItem;
