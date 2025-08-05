import * as React from "react";
import style from "./LoreBookForm.module.scss";
import { loreBookStrategyOptions } from "src/enums/LoreBookStrategy.ts";
import { FormFields, FormInput, InputControlled } from "src/components/Form";
import LoreBookEntries from "src/components/LoreBookModal/components/LoreBookEntries/LoreBookEntries.tsx";
import Button from "src/components/Button/Button.tsx";
import { Save } from "lucide-react";
import Form from "src/components/Form/Form.tsx";
import { LoreBookFormDto } from "src/components/LoreBookModal/LoreBookModal.tsx";
import { LoreBook } from "src/store/LoreBook.ts";

type Props = {
  loreBook: LoreBook;
  onSubmit: () => void;
};

const LoreBookForm: React.FC<Props> = (props) => {
  const { loreBook, onSubmit } = props;

  return (
    <Form<LoreBookFormDto>
      initialValue={React.useMemo<LoreBookFormDto>(() => ({
        name: loreBook.name,
        depth: String(loreBook.depth),
        entries: loreBook.entries.map(entry => ({
          entryId: entry.id,
          name: entry.name,
          active: entry.active,
          keywords: entry.keywords.map(keyword => ({ value: keyword, label: keyword })),
          strategy: loreBookStrategyOptions.find(o => o.value === entry.strategy) || loreBookStrategyOptions[0],
          position: entry.position ? { value: entry.position, label: entry.position } : null,
          depth: String(entry.depth || ""),
          content: entry.content,
        })),
      }), [loreBook])}
      onSubmit={React.useCallback((dto: LoreBookFormDto) => {
        loreBook.update({
          name: dto.name,
          depth: Number(dto.depth) || 4,
          entries: dto.entries.map(entry => ({
            id: entry.entryId,
            name: entry.name,
            active: entry.active,
            keywords: entry.keywords.map(option => option.value),
            strategy: entry.strategy.value,
            position: entry.position?.value || "",
            depth: Number(entry.depth) || null,
            content: entry.content,
          })),
        });
        onSubmit();
      }, [])}
    >
      <FormFields>
        <FormInput label="Name" name="name">
          <InputControlled name="name" />
        </FormInput>
        <FormInput label="Default scan depth" name="depth">
          <InputControlled name="depth" type="number" />
        </FormInput>
        <LoreBookEntries />
      </FormFields>
      <div className={style.footer}>
        <Button block iconBefore={Save}>Save</Button>
      </div>
    </Form>
  );
};

export default React.memo(LoreBookForm) as typeof LoreBookForm;
