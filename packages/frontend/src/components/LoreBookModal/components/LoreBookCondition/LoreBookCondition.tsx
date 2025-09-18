import * as React from "react";
import style from "./LoreBookCondition.module.scss";
import { CreatableSelectControlled, SelectControlled } from "src/components/Form";
import { loreBookConditionOptions } from "src/enums/LoreBookConditionType.ts";
import { Trash } from "lucide-react";
import Button from "src/components/Button/Button.tsx";

type Props = {
  baseName: string;
  onRemove: () => void;
};

const LoreBookCondition: React.FC<Props> = (props) => {
  const { baseName, onRemove } = props;

  return (
    <div className={style.container}>
      <div className={style.type}>
        <SelectControlled
          name={`${baseName}.type`}
          options={loreBookConditionOptions}
        />
      </div>
      <div className={style.keywords}>
        <CreatableSelectControlled name={`${baseName}.keywords`} isMulti />
      </div>
      <div className={style.delete}>
        <Button
          type="button"
          iconBefore={Trash}
          onClick={onRemove}
        />
      </div>
    </div>
  );
};

export default React.memo(LoreBookCondition) as typeof LoreBookCondition;
