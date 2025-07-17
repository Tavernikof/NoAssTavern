import * as React from "react";
import { useController } from "react-hook-form";
import Checkbox from "./Checkbox.tsx";

type Props = {
  name: string;
} & React.ComponentProps<typeof Checkbox>;

const CheckboxControlled: React.FC<Props> = (props) => {
  const { name, ...inputProps } = props;
  const { field: { value, ...field } } = useController({ name });
  return <Checkbox {...inputProps} checked={value} {...field} />;
};

export default React.memo(CheckboxControlled);