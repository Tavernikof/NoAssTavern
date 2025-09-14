import * as React from "react";
import style from "./CharactersList.module.scss";
import { observer } from "mobx-react-lite";
import { charactersManager } from "src/store/CharactersManager.ts";
import { openCharacterModal } from "src/components/CharacterModal";
import CharacterAvatar from "src/components/CharacterAvatar";
import Button from "src/components/Button";
import { Copy, Trash } from "lucide-react";
import Tooltip from "src/components/Tooltip";

type Props = Record<string, never>;

const CharactersList: React.FC<Props> = () => {
  return (
    <div className={style.list}>
      {charactersManager.fullList.map((character) => {
        return (
          <div key={character.id} className={style.card}>
            <button className={style.item} onClick={() => openCharacterModal({ character })}>
              <CharacterAvatar name={character.name} imageId={character.imageId} className={style.avatar} />
              <span className={style.name}>{character.name}</span>
            </button>
            <div className={style.actions}>
              <Button
                size="small"
                onClickCapture={() => openCharacterModal({ character: character.clone() }).result.then(character => {
                  charactersManager.add(character);
                })}
                iconBefore={Copy}
              />
              <Tooltip
                content={() => (
                  <div className={style.tooltip}>
                    <div>Delete character?</div>
                    <Button size="small" onClickCapture={() => charactersManager.remove(character)}>
                      Delete
                    </Button>
                  </div>
                )}
              >
                {({ getReferenceProps, elementRef }) => (
                  <Button
                    ref={elementRef}
                    type="button"
                    iconBefore={Trash}
                    {...getReferenceProps({
                      onClick: (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      },
                    })}
                  />
                )}
              </Tooltip>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default observer(CharactersList) as typeof CharactersList;
