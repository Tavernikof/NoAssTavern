import * as React from "react";
import style from "./FormFields.module.scss";

type Props = React.PropsWithChildren;

const FormFields: React.FC<Props> = (props) => {
  const { children } = props;

  return (
    <div className={style.container}>{children}</div>
  );
};

export default React.memo(FormFields) as typeof FormFields;
