import * as React from "react";
import { useController } from "react-hook-form";
import Select from "./Select.tsx";

export type SelectOption = {
  value: string;
  label: string;
}

type Props = {
  name: string;
} & React.ComponentProps<typeof Select>;

const SelectControlled: React.FC<Props> = (props) => {
  const { name, ...inputProps } = props;
  const { field } = useController({ name });
  return <Select {...inputProps} {...field} />;
};

export default React.memo(SelectControlled);