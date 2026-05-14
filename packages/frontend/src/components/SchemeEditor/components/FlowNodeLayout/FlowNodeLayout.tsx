import * as React from "react";
import style from "./FlowNodeLayout.module.scss";
import DefaultFlowNodes from "../DefaultFlowNodes";
import clsx from "clsx";
import FlowNodeUpdater from "../FlowNodeUpdater";
import { useFlowNodeContext } from "src/components/SchemeEditor/helpers/FlowNodeContext.ts";
import { FormProvider, useForm } from "react-hook-form";

type Props = React.PropsWithChildren<{
  initialValue: Record<string, any>
}>;

const FlowNodeLayout: React.FC<Props> = (props) => {
  const { initialValue, children } = props;

  const flowNodeContext = useFlowNodeContext();

  const form = useForm({
    defaultValues: initialValue,
  });

  if (!flowNodeContext) return null;
  return (
    <div className={style.container}>
      <div className={style.title}>{flowNodeContext.label}</div>
      <FormProvider {...form}>
        <div className={clsx(style.body, "nodrag")}>
          {children}
        </div>
        <FlowNodeUpdater />
      </FormProvider>
      <DefaultFlowNodes />
    </div>
  );
};

export default React.memo(FlowNodeLayout) as typeof FlowNodeLayout;
