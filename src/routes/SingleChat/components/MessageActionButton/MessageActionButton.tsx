import * as React from "react";
import style from "./MessageActionButton.module.scss";
import clsx from "clsx";
import { LucideProps } from "lucide-react";

type Props = {
  active?: boolean,
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref">>,
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const MessageActionButton = React.forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const { icon, active, ...buttonProps } = props;

  return (
    <button
      ref={ref}
      type="button"
      {...buttonProps}
      className={clsx(style.action, active && style.actionActive, buttonProps.className)}
    >
      {React.createElement(icon, { size: 16 })}
    </button>
  );
});

export default React.memo(MessageActionButton) as typeof MessageActionButton;
