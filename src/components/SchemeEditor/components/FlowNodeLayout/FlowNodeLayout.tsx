import * as React from "react";
import style from "./FlowNodeLayout.module.scss";
import DefaultFlowNodes from "../DefaultFlowNodes";
import clsx from "clsx";
import Form from "src/components/Form";
import FlowNodeUpdater from "../FlowNodeUpdater";
import { useFlowNodeContext } from "src/components/SchemeEditor/helpers/FlowNodeContext.ts";

type Props = React.PropsWithChildren<{
  initialValue: Record<string, any>
}>;

const FlowNodeLayout: React.FC<Props> = (props) => {
  const { initialValue, children } = props;

  const flowNodeContext = useFlowNodeContext();
  if (!flowNodeContext) return null;
  return (
    <div className={style.container}>
      <div className={style.title}>{flowNodeContext.label}</div>
      <Form initialValue={initialValue}>
        <div className={clsx(style.body, "nodrag")}>
          {children}
        </div>
        <FlowNodeUpdater />
      </Form>
      <DefaultFlowNodes />
    </div>
  );
};

export default React.memo(FlowNodeLayout) as typeof FlowNodeLayout;
