import * as React from "react";
import { useModalContext } from "src/components/Modals";
import { observer } from "mobx-react-lite";
import { Character } from "src/store/Character.ts";
import Tabs, { TabItem } from "src/components/Tabs";
import LoreBookForm from "src/components/LoreBookModal/components/LoreBookForm";
import CharacterForm from "src/components/CharacterModal/components/CharacterForm";
import Button from "src/components/Button";
import { Plus } from "lucide-react";

type Props = {
  character: Character;
  local?: boolean;
};

const CharacterModal: React.FC<Props> = (props) => {
  const { character } = props;
  const { resolve } = useModalContext();

  const items = React.useMemo<TabItem[]>(() => ([
    {
      key: "character",
      title: "Info",
      content: () => <CharacterForm character={character} onSubmit={resolve} />,
    },
    {
      key: "loreBook",
      title: "Lorebook",
      content: () => (
        <>
          {character.loreBook
            ? <LoreBookForm loreBook={character.loreBook} onSubmit={resolve} />
            : <Button iconBefore={Plus} onClick={character.initLoreBook}>Create lorebook</Button>
          }
        </>
      ),
    },
  ]), [character.loreBook]);

  return <Tabs items={items} />;
};

export default observer(CharacterModal) as typeof CharacterModal;
