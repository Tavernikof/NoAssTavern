import { validateCharacterCard } from "../helpers/validateCharacterCard.ts";
import { convertFileToBlob } from "../helpers/convertFileToBlob.ts";
import { charactersStorage, CharacterStorageItem } from "src/storages/CharactersStorage.ts";
import { Character } from "src/store/Character.ts";
import { parseCharacterCard } from "src/helpers/parseCharacterCard.ts";
import { AbstractManager } from "src/helpers/AbstractManager.ts";

export class CharactersManager extends AbstractManager<Character, CharacterStorageItem> {
  constructor() {
    super(charactersStorage, Character);
  }

  getLabel(entity: Character): string {
    return entity.name;
  }

  import = (file: File) => {
    parseCharacterCard(file).then(
      (info) => {
        if (!info) return alert("Wrong card!");
        try {
          if (validateCharacterCard(info)) {
            convertFileToBlob(file).then((image) => {
              Character.createFromCard(info, image).then(item => {
                this.add(item);
              });
            });
          }
        } catch (e) {
          if (e instanceof Error) alert(e.message);
        }
      },
      (e) => {
        if (e instanceof Error) alert(e.message);
      });
  };
}

export const charactersManager = new CharactersManager();
window.charactersManager = charactersManager;
