import * as React from "react";
import { useModalContext } from "src/components/Modals";
import { LoreBook } from "src/store/LoreBook.ts";
import { LoreBookStrategy } from "src/enums/LoreBookStrategy.ts";
import LoreBookForm from "src/components/LoreBookModal/components/LoreBookForm";
import { LoreBookConditionType } from "src/enums/LoreBookConditionType.ts";

export type LoreBookFormEntry = {
  entryId: string;
  name: string;
  active: boolean;
  conditions: {
    type: { value: LoreBookConditionType, label: string };
    keywords: { value: string, label: string }[];
  }[];
  strategy: { value: LoreBookStrategy, label: string };
  position: { value: string, label: string } | null;
  depth: string;
  content: string;
};

export type LoreBookFormDto = {
  name: string;
  depth: string;
  entries: LoreBookFormEntry[],
};

type Props = {
  loreBook: LoreBook
};

const LoreBookModal: React.FC<Props> = (props) => {
  const { loreBook } = props;
  const { resolve } = useModalContext();

  return (
    <LoreBookForm loreBook={loreBook} onSubmit={resolve} />
  );
};

export default React.memo(LoreBookModal) as typeof LoreBookModal;
