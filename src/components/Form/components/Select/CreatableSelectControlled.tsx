import * as React from "react";
import { useController } from "react-hook-form";
import CreatableSelect from "./CreatableSelect.tsx";

type Props = {
  name: string;
} & React.ComponentProps<typeof CreatableSelect>;

const CreatableSelectControlled: React.FC<Props> = (props) => {
  const { name, ...inputProps } = props;
  const { field } = useController({ name });
  return <CreatableSelect {...inputProps} {...field} />;
};

export default React.memo(CreatableSelectControlled);