import * as React from "react";
import style from "./ChatMessageError.module.scss";

type Props = React.PropsWithChildren;

const ChatMessageError: React.FC<Props> = (props) => {
  return (
    <div className={style.container}>
      {React.isValidElement(props.children) || typeof props.children === "string"
        ? props.children
        : "Unexpected error"
      }
    </div>
  );
};

export default React.memo(ChatMessageError) as typeof ChatMessageError;
