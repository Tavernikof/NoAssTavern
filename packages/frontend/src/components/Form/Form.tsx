import * as React from "react";
import { FormProvider, useForm, FieldValues, UseFormProps, SubmitHandler, DefaultValues } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { Schema } from "joi";
import { useFlowNodeContext } from "src/components/SchemeEditor/helpers/FlowNodeContext.ts";
// import style from "./Form.module.scss";

type Props<FV extends FieldValues = FieldValues> = React.PropsWithChildren<{
  initialValue: UseFormProps<FV>["defaultValues"];
  onSubmit?: SubmitHandler<FV>,
  validationSchema?: Schema,
}>

const Form = <FV extends FieldValues = FieldValues>(props: Props<FV>) => {
  const { initialValue, onSubmit, validationSchema, children } = props;

  const flowNodeContext = useFlowNodeContext();

  const defaultValues = React.useMemo(() => {
    const defaultValues: Record<string, any> = {};
    if (flowNodeContext?.initialState) Object.assign(defaultValues, flowNodeContext.initialState);
    if (initialValue) Object.assign(defaultValues, initialValue);
    return defaultValues as DefaultValues<FV>;
  }, []);

  const form = useForm<FV>({
    defaultValues,
    resolver: validationSchema ? joiResolver(validationSchema) : undefined,
  });

  const { handleSubmit } = form;

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit ? handleSubmit(onSubmit) : undefined}>
        {children}
      </form>
    </FormProvider>
  );
};

export default React.memo(Form) as typeof Form;
