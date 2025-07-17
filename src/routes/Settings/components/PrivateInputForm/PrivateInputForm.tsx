import * as React from "react";
import style from "./PrivateInputForm.module.scss";
import Input from "src/components/Form/components/Input";
import { FormInput } from "src/components/Form";
import Button from "src/components/Button";
import { Eye, EyeOff } from "lucide-react";

type Props = {
  label: React.ReactNode,
  value: string,
  onChange: (value: string) => void;
};

const PrivateInputForm: React.FC<Props> = (props) => {
  const { label, value, onChange } = props;
  const [localValue, setLocalValue] = React.useState(value);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => setLocalValue(value), [value]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target;
    if ("value" in form) onChange((form.value as HTMLInputElement).value);
  };

  return (
    <form onSubmit={onSubmit}>
      <FormInput label={label}>
        <div className={style.row}>
          <Input
            name="value"
            type={visible ? "text" : "password"}
            value={localValue}
            onChange={e => setLocalValue(e.target.value)}
          />
          <Button type="button" iconBefore={visible ? Eye : EyeOff} onClick={() => setVisible(!visible)} />
        </div>
      </FormInput>
      {value !== localValue && <div className={style.label}>Press enter to save</div>}
    </form>
  );
};

export default React.memo(PrivateInputForm) as typeof PrivateInputForm;
