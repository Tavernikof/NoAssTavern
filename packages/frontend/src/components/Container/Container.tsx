import * as React from "react";
import style from "./Container.module.scss";

type Props = React.PropsWithChildren;

const Container: React.FC<Props> = (props) => {
  return (
    <div className={style.container}>
      <div className={style.content}>
        {props.children}
      </div>
    </div>
  );
};

export default React.memo(Container) as typeof Container;
