import * as React from "react";
import { FormProvider, useForm, FieldValues, UseFormProps, SubmitHandler } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { Schema } from "joi";
// import style from "./Form.module.scss";

type Props<FV extends FieldValues = FieldValues> = React.PropsWithChildren<{
  className?: string;
  initialValue: UseFormProps<FV>["defaultValues"];
  onSubmit?: SubmitHandler<FV>,
  validationSchema?: Schema,
}>

const Form = <FV extends FieldValues = FieldValues>(props: Props<FV>) => {
  const { className, initialValue, onSubmit, validationSchema, children } = props;

  const form = useForm<FV>({
    defaultValues: initialValue,
    resolver: validationSchema ? joiResolver(validationSchema) : undefined,
  });

  const { handleSubmit } = form;

  return (
    <FormProvider {...form}>
      <form className={className} onSubmit={onSubmit ? handleSubmit(onSubmit) : undefined}>
        {children}
      </form>
    </FormProvider>
  );
};

export default React.memo(Form) as typeof Form;
