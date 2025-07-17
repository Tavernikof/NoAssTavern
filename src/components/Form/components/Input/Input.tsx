import * as React from "react";
import clsx from "clsx";
import style from "./Input.module.scss";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, Props>((props, ref) => {
  const { ...inputProps } = props;

  return (
    <input
      ref={ref}
      {...inputProps}
      className={clsx(style.input, inputProps.className)}
    />
  );
});

export default React.memo(Input) as typeof Input;
