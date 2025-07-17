import * as React from "react";
import { useController } from "react-hook-form";
import Input from "./Input.tsx";

type Props = {
  name: string;
} & React.ComponentProps<typeof Input>;

const InputControlled: React.FC<Props> = (props) => {
  const { name, ...inputProps } = props;
  const { field } = useController({ name });
  return <Input {...inputProps} {...field} />;
};

export default React.memo(InputControlled);