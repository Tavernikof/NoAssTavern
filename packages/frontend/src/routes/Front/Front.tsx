import * as React from "react";
import style from "./Front.module.scss";

type Props = {};

const Front: React.FC<Props> = (props) => {
  const {} = props;

  return (
    <div></div>
  );
};

export default React.memo(Front) as typeof Front;
