import { action, makeObservable, observable } from "mobx";
import Exifreader, { Tags } from "exifreader";
import { validateCharacterCard } from "../helpers/validateCharacterCard.ts";
import { convertFileToBlob } from "../helpers/convertFileToBlob.ts";
import { decodeBase64 } from "../helpers/decodeBase64.ts";
import { charactersStorage } from "src/storages/CharactersStorage.ts";
import { Character } from "src/store/Character.ts";

export class CharactersManager {
  @observable characters: string[] = [];
  @observable charactersDict: Record<string, Character> = {};

  constructor() {
    makeObservable(this);

    charactersStorage.getItems().then(action((data) => {
      const list: string[] = [];
      const dict: Record<string, Character> = {};
      data.forEach(card => {
        list.push(card.id);
        dict[card.id] = new Character(card);
      });
      this.characters = list;
      this.charactersDict = dict;
    }));
  }

  @action
  add(character: Character) {
    this.characters.unshift(character.id);
    this.charactersDict[character.id] = character;
    character.save();
  }

  @action
  remove(character: Character) {
    this.characters = this.characters.filter(characterId => characterId !== character.id);
    delete this.charactersDict[character.id];
    charactersStorage.removeItem(character.id);
  }

  import = (file: File) => {
    return (Exifreader.load(file) as unknown as Promise<Tags>).then(tags => {
      const description = tags?.chara?.value;
      if (!description) return alert("Wrong card!");
      const info = decodeBase64(description);
      if (!info) return alert("Wrong card!");
      try {
        if (validateCharacterCard(info)) {
          convertFileToBlob(file).then(action((image) => {
            const item = Character.createFromCard(info, image);
            this.characters.unshift(item.id);
            this.charactersDict[item.id] = item;
          }));
        }
      } catch (e) {
        if (e instanceof Error) alert(e.message);
      }
    });
  };
}

export const charactersManager = new CharactersManager();