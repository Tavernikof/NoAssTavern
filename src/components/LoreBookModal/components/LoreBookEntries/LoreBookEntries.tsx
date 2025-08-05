import * as React from "react";
import style from "./LoreBookEntries.module.scss";
import { useFieldArray, useFormContext } from "react-hook-form";
import { LoreBookFormDto } from "src/components/LoreBookModal/LoreBookModal.tsx";
import Button from "src/components/Button/Button.tsx";
import { Plus } from "lucide-react";
import LoreBookEntry from "src/components/LoreBookModal/components/LoreBookEntry";
import _cloneDeep from "lodash/cloneDeep";
import { v4 as uuid } from "uuid";
import { loreBookStrategyOptions } from "src/enums/LoreBookStrategy.ts";

type Props = Record<string, never>;

const LoreBookEntries: React.FC<Props> = () => {
  const form = useFormContext<LoreBookFormDto>();
  const { fields, prepend, remove, insert, move } = useFieldArray<LoreBookFormDto, "entries">({ name: "entries" });

  return (
    <div className={style.container}>
      <div className={style.title}>
        Entries:
        <Button
          size="small"
          iconBefore={Plus}
          type="button"
          onClick={() => prepend({
            entryId: uuid(),
            name: "",
            active: true,
            strategy: loreBookStrategyOptions[0],
            position: null,
            depth: "",
            content: "",
          })}
        >
          Add
        </Button>
      </div>
      {!fields.length && <div className={style.empty}>No entries</div>}
      {fields.map((field, index) => <LoreBookEntry
        key={field.id}
        entry={field}
        index={index}
        onMove={(offset) => move(index, index + offset)}
        onClone={() => {
          const { entries } = form.getValues();
          const newEntry = _cloneDeep(entries[index]);
          newEntry.entryId = uuid();
          newEntry.name += " (copy)";
          insert(index, newEntry);
        }}
        onRemove={() => remove(index)}
      />)}
      <div>

      </div>
    </div>
  );
};

export default React.memo(LoreBookEntries) as typeof LoreBookEntries;
