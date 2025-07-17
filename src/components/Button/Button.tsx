import * as React from "react";
import style from "./Button.module.scss";
import clsx from "clsx";

type Props = {
  iconBefore?: React.FC<{ className?: string }>;
  block?: boolean;
  size?: "small";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = React.forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const { iconBefore, block, children, size, ...buttonProps } = props;

  return (
    <button
      ref={ref}
      {...buttonProps}
      className={clsx(
        style.button,
        block && style.block,
        !children && style.noChildren,
        size === "small" && style.small,
        buttonProps.className,
      )}
    >
      {iconBefore && React.createElement(iconBefore, { className: style.icon })}
      {!!children && <span>{children}</span>}
    </button>
  );
});

export default React.memo(Button) as typeof Button;
