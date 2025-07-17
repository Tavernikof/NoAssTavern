import * as React from "react";
import style from "./Subtitle.module.scss";

type Props = React.PropsWithChildren;

const Subtitle: React.FC<Props> = (props) => {
  const {children} = props;

  return (
    <div className={style.title}>{children}</div>
  );
};

export default React.memo(Subtitle) as typeof Subtitle;
