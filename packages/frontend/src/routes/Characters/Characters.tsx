import * as React from "react";
import { observer } from "mobx-react-lite";
import CharactersList from "./components/CharactersList";
import Title from "src/components/Title";
import style from "./Characters.module.scss";
import ImportButton from "src/components/ImportButton";
import { charactersManager } from "src/store/CharactersManager.ts";
import { Book, BookPlus, UserPlus, Users } from "lucide-react";
import Button from "src/components/Button";
import { openCharacterModal } from "src/components/CharacterModal";
import { Character } from "src/store/Character.ts";
import { openLoreBookModal } from "src/components/LoreBookModal";
import { LoreBook } from "src/store/LoreBook.ts";
import { loreBookManager } from "src/store/LoreBookManager.ts";
import LoreBooksList from "src/routes/Characters/components/LoreBooksList/LoreBooksList.tsx";

type Props = Record<string, never>;

const Characters: React.FC<Props> = () => {
  return (
    <div className={style.blocks}>
      <div>
        <Title><Users /> Characters</Title>
        <div className={style.actions}>
          <Button
            iconBefore={UserPlus}
            onClick={() => {
              openCharacterModal({ character: Character.createEmpty() }).result.then(character => {
                charactersManager.add(character);
              });
            }}>
            Create
          </Button>
          <ImportButton onUpload={charactersManager.import} text="Import" />
        </div>
        <CharactersList />
      </div>

      <div>
        <Title><Book/> Lorebooks</Title>
        <div className={style.actions}>
          <Button
            iconBefore={BookPlus}
            onClick={() => {
              openLoreBookModal({ loreBook: LoreBook.createEmpty() }).result.then(loreBook => {
                loreBookManager.add(loreBook);
              });
            }}>
            Create
          </Button>
          <ImportButton onUpload={loreBookManager.import} text="Import" />
        </div>
        <LoreBooksList />
      </div>
    </div>
  );
};

export default observer(Characters) as typeof Characters;
