import * as React from "react";
import { useController } from "react-hook-form";
import Textarea from "./Textarea.tsx";

type Props = {
  name: string;
} & React.ComponentProps<typeof Textarea>;

const TextareaControlled: React.FC<Props> = (props) => {
  const { name, ...inputProps } = props;
  const { field } = useController({ name });
  return <Textarea {...inputProps} {...field} />;
};

export default React.memo(TextareaControlled);