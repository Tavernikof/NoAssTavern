import { action, makeObservable, observable } from "mobx";
import { validateCharacterCard } from "../helpers/validateCharacterCard.ts";
import { convertFileToBlob } from "../helpers/convertFileToBlob.ts";
import { charactersStorage } from "src/storages/CharactersStorage.ts";
import { Character } from "src/store/Character.ts";
import { parseCharacterCard } from "src/helpers/parseCharacterCard.ts";


export class CharactersManager {
  @observable characters: string[] = [];
  @observable charactersDict: Record<string, Character> = {};
  @observable ready = false;

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
      this.ready = true;
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
    parseCharacterCard(file).then((info) => {
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
window.charactersManager = charactersManager;
