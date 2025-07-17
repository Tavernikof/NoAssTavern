import * as React from "react";
import style from "./NotFound.module.scss";

type Props = {};

const NotFound: React.FC<Props> = (props) => {
  const {} = props;

  return (
    <div>NotFound</div>
  );
};

export default React.memo(NotFound) as typeof NotFound;
