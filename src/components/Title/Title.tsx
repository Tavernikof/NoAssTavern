import * as React from "react";
import style from "./Title.module.scss";

type Props = React.PropsWithChildren;

const Title: React.FC<Props> = (props) => {
  const {children} = props;

  return (
    <div className={style.title}>{children}</div>
  );
};

export default React.memo(Title) as typeof Title;
