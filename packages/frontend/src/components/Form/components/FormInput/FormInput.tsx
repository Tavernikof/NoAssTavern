import * as React from "react";
import style from "./FormInput.module.scss";
import FormError from "src/components/Form/components/FormError";

type Props = React.PropsWithChildren<{
  icon?: React.FC<{ className?: string }>;
  label: React.ReactNode;
  name?: string
  action?: React.ReactNode;
}>;

const FormInput: React.FC<Props> = (props) => {
  const { icon, label, name, action, children } = props;

  return (
    <div className={style.container}>
      <div className={style.top}>
        <div className={style.label}>
          {icon && React.createElement(icon, { className: style.icon })}
          {label || "\u00A0"}
        </div>
        {action && <div className={style.action}>{action}</div>}
      </div>
      {children}
      {name ? <FormError name={name} /> : null}
    </div>
  );
};

export default React.memo(FormInput) as typeof FormInput;
