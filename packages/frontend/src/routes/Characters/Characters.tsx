import * as React from "react";
import { observer } from "mobx-react-lite";
import CharactersList from "./components/CharactersList";
import Title from "src/components/Title";
import style from "./Characters.module.scss";
import ImportButton from "src/components/ImportButton";
import { charactersManager } from "src/store/CharactersManager.ts";
import { UserPlus } from "lucide-react";
import Button from "src/components/Button";
import { openCharacterModal } from "src/components/CharacterModal";
import { Character } from "src/store/Character.ts";

type Props = Record<string, never>;

const Characters: React.FC<Props> = () => {
  return (
    <>
      <Title>Characters</Title>
      <div className={style.actions}>
        <ImportButton onUpload={charactersManager.import} text="Import" />
        <Button
          iconBefore={UserPlus}
          onClick={() => {
            openCharacterModal({ character: Character.createEmpty() }).result.then(character => {
              charactersManager.add(character);
            });
          }}>
          Create
        </Button>
      </div>
      <CharactersList />
    </>
  );
};

export default observer(Characters) as typeof Characters;
