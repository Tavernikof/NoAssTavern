import * as React from "react";
import style from "./LoreBookEntry.module.scss";
import {
  CheckboxControlled,
  CreatableSelectControlled,
  FormInput,
  InputControlled,
  SelectControlled,
  TextareaControlled,
} from "src/components/Form";
import { LoreBookFormDto, LoreBookFormEntry } from "src/components/LoreBookModal/LoreBookModal.tsx";
import Button from "src/components/Button";
import { Copy, Trash, ChevronUp, ChevronDown, Plus } from "lucide-react";
import MessageActionButton from "src/routes/SingleChat/components/MessageActionButton";
import { loreBookStrategyOptions } from "src/enums/LoreBookStrategy.ts";
import { useFieldArray, useWatch } from "react-hook-form";
import LoreBookCondition from "src/components/LoreBookModal/components/LoreBookCondition";
import { loreBookConditionOptions } from "src/enums/LoreBookConditionType.ts";

const DEFAULT_POSITION = { label: "in_chat", value: "in_chat" };

type Props = {
  entry: LoreBookFormEntry;
  index: number;
  onClone: () => void;
  onRemove: () => void;
  onMove: (offset: number) => void;
};

const LoreBookEntry: React.FC<Props> = (props) => {
  const { index, onClone, onRemove, onMove } = props;
  const baseName = `entries.${index}`;
  const defaultDepth = useWatch<LoreBookFormDto, "depth">({ name: "depth" });

  const {
    fields,
    append,
    remove,
  } = useFieldArray<LoreBookFormDto, `entries.${number}.conditions`>({ name: `entries.${index}.conditions` });

  return (
    <div className={style.container}>
      <div className={style.aside}>
        <div className={style.index}>{index + 1}.</div>
        <div className={style.sort}>
          <CheckboxControlled name={`${baseName}.active`} />
          <MessageActionButton icon={ChevronUp} onClick={() => onMove(-1)} />
          <MessageActionButton icon={ChevronDown} onClick={() => onMove(1)} />
        </div>
      </div>
      <div className={style.content}>
        <div className={style.row}>
          <div className={style.name}>
            <FormInput label="Name">
              <InputControlled name={`${baseName}.name`} />
            </FormInput>
          </div>

          <div className={style.strategy}>
            <FormInput label="Strategy">
              <SelectControlled
                name={`${baseName}.strategy`}
                options={loreBookStrategyOptions}
              />
            </FormInput>
          </div>

          <div className={style.position}>
            <FormInput label="Position group">
              <CreatableSelectControlled
                name={`${baseName}.position`}
                options={[DEFAULT_POSITION]}
                placeholder="Default"
                isClearable
              />
            </FormInput>
          </div>

          <div className={style.depth}>
            <FormInput label="Scan depth">
              <InputControlled type="number" name={`${baseName}.depth`} placeholder={defaultDepth} />
            </FormInput>
          </div>

          <FormInput label="">
            <div className={style.actions}>
              <Button
                type="button"
                iconBefore={Copy}
                onClick={onClone}
              />
              <Button
                type="button"
                iconBefore={Trash}
                onClick={onRemove}
              />
            </div>
          </FormInput>
        </div>

        <div className={style.conditions}>
          <div>Keywords</div>
          {fields.map((field, index) => (
            <LoreBookCondition
              key={field.id}
              baseName={`${baseName}.conditions.${index}`}
              onRemove={() => remove(index)}
            />
          ))}
          <div>
            <Button
              size="small"
              iconBefore={Plus}
              type="button"
              onClick={() => append({
                type: loreBookConditionOptions[0],
                keywords: [],
              })}
            >
              Add condition
            </Button>
          </div>
        </div>

        <FormInput label="Content">
          <TextareaControlled name={`${baseName}.content`} autoHeight />
        </FormInput>
      </div>

    </div>
  );
};

export default React.memo(LoreBookEntry) as typeof LoreBookEntry;
