import * as React from "react";
import style from "./FormError.module.scss";
import { useFormState } from "react-hook-form";
import ErrorMessage from "src/components/ErrorMessage";

type Props = {
  name: string
};

const FormError: React.FC<Props> = (props) => {
  const { name } = props;
  const state = useFormState({ name });
  const error = state.errors[name];

  const errorMessage = React.useMemo(() => {
    if (!error) return null;
    if (typeof error.message === "string") return error.message;

    const message: string[] = [];
    for (const key in error) {
      // @ts-expect-error shit
      const innerError = error[key];
      if (typeof innerError.message === "string") message.push(innerError.message);
    }
    return message.join(", ");
  }, [error]);

  return errorMessage
    ? <ErrorMessage className={style.error}>{errorMessage}</ErrorMessage>
    : null;
};

export default React.memo(FormError) as typeof FormError;
