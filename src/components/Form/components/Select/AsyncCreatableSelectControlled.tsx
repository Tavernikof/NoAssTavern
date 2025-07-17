import * as React from "react";
import { useController } from "react-hook-form";
import AsyncCreatableSelect from "./AsyncCreatableSelect.tsx";

type Props = {
  name: string;
} & React.ComponentProps<typeof AsyncCreatableSelect>;

const AsyncCreatableSelectControlled: React.FC<Props> = (props) => {
  const { name, ...inputProps } = props;
  const { field } = useController({ name });
  return <AsyncCreatableSelect {...inputProps} {...field} />;
};

export default React.memo(AsyncCreatableSelectControlled);