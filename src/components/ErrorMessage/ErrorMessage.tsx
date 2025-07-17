import * as React from "react";
import style from "./ErrorMessage.module.scss";
import clsx from "clsx";

type Props = React.PropsWithChildren<{
  className?: string
}>;

const ErrorMessage: React.FC<Props> = (props) => {
  const { className, children } = props;


  return (
    <div className={clsx(style.error, className)}>{children}</div>
  );
};

export default React.memo(ErrorMessage) as typeof ErrorMessage;
