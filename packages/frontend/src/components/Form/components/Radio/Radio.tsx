import * as React from "react";
import style from "./Radio.module.scss";
import clsx from "clsx";
import { mergeRefs } from "react-merge-refs";

export type Props = Omit<React.HTMLProps<HTMLInputElement>, "label"> & {
  label?: React.ReactNode,
  error?: string,
}

const Radio = React.forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { className, label, error, ...restProps } = props;
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <label className={clsx(style.container, className)}>
      <input
        ref={mergeRefs([inputRef, ref])}
        {...restProps}
        type="radio"
        className={style.input}
      />
      <span className={clsx(style.content, (label || error) && style.contentFilled)}>
        {label && <span className={style.label}>{label}</span>}
        {error && <span className={style.error}>{error}</span>}
      </span>
    </label>
  );
});

export default React.memo(Radio) as typeof Radio;
