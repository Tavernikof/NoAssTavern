import { action, autorun, makeObservable, observable, toJS } from "mobx";
import { charactersStorage, CharacterStorageItem } from "src/storages/CharactersStorage.ts";
import { v4 as uuid } from "uuid";
import { CharacterCardV2 } from "src/helpers/validateCharacterCard.ts";
import _cloneDeep from "lodash/cloneDeep";

type CharacterCreateConfig = {
  isNew?: boolean
  local?: boolean
}

export class Character {
  @observable id: string;
  @observable createdAt: Date;
  @observable name: string;
  @observable description: string;
  @observable scenario: string;
  @observable greetings: string[];
  @observable image: Blob | null;

  card: CharacterCardV2 | null;

  @observable isNew: boolean;
  local: boolean;

  constructor(card: CharacterStorageItem, config?: CharacterCreateConfig) {
    this.isNew = config?.isNew ?? false;
    this.local = config?.local ?? false;

    this.update(card);

    makeObservable(this);

    if (!this.local) {
      autorun(() => {
        if (this.isNew) return;
        const object = this.serialize();
        charactersStorage.updateItem(object);
      });
    }
  }

  static createEmpty(): Character {
    return new this({
      id: uuid(),
      createdAt: new Date(),
      name: "",
      description: "",
      scenario: "",
      greetings: [],
      card: null,
      image: null,
    }, { isNew: true });
  }

  static createFromCard(card: CharacterCardV2, image: Blob): Character {
    const { data } = card;
    let description = data.description;
    if (data.personality) description += "\n\nPersonality:\n" + data.personality;
    if (data.mes_example) description += "\n\nExample Dialogs:\n" + data.mes_example;

    return new this({
      id: uuid(),
      createdAt: new Date(),
      name: card.data.name || "",
      description: description,
      scenario: card.data.scenario || "",
      greetings: [card.data.first_mes || "", ...(card.data.alternate_greetings || [])],
      card,
      image,
    });
  }

  @action
  update(characterContent: Partial<CharacterStorageItem>) {
    for (const field in characterContent) {
      const data = characterContent[field as keyof CharacterStorageItem];
      // @ts-expect-error fuck ts
      if (data !== undefined) this[field] = data;
    }
  }

  @action
  save() {
    this.isNew = false;
  }

  @action
  clone(local?: boolean) {
    const characterStorageItem = _cloneDeep(this.serialize());
    characterStorageItem.id = uuid();
    characterStorageItem.createdAt = new Date();
    return new Character(characterStorageItem, { isNew: true, local });
  }

  serialize(): CharacterStorageItem {
    return {
      id: this.id,
      createdAt: this.createdAt,
      name: this.name,
      description: this.description,
      scenario: this.scenario,
      greetings: toJS(this.greetings),
      image: this.image,
      card: this.card ? toJS(this.card) : null,
    };
  }
}