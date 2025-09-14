import * as React from "react";
import { useController } from "react-hook-form";
import Radio from "./Radio.tsx";

type Props = {
  name: string;
} & React.ComponentProps<typeof Radio>;

const RadioControlled: React.FC<Props> = (props) => {
  const { name, ...inputProps } = props;
  const { field: { value, ...field } } = useController({ name });
  return <Radio {...inputProps} checked={inputProps.value === value} {...field} />;
};

export default React.memo(RadioControlled);