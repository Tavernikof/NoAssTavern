import { action, autorun, makeObservable, observable, toJS } from "mobx";
import { charactersStorage, CharacterStorageItem } from "src/storages/CharactersStorage.ts";
import { v4 as uuid } from "uuid";
import { CharacterCardV2 } from "src/helpers/validateCharacterCard.ts";
import _cloneDeep from "lodash/cloneDeep";

export class Character {
  @observable id: string;
  @observable createdAt: Date;
  @observable name: string;
  @observable description: string;
  @observable personality: string;
  @observable scenario: string;
  @observable greetings: string[];
  @observable image: Blob | null;

  card: CharacterCardV2 | null;

  @observable isNew: boolean;

  constructor(card: CharacterStorageItem, config?: CharacterCreateConfig) {
    this.isNew = config?.isNew ?? false;

    this.update(card);

    makeObservable(this);

    autorun(() => {
      if (this.isNew) return;
      const object = this.serialize();
      charactersStorage.updateItem(object);
    });
  }

  static createEmpty(): Character {
    return new this({
      id: uuid(),
      createdAt: new Date(),
      name: "",
      description: "",
      scenario: "",
      personality: "",
      greetings: [],
      card: null,
      image: null,
    }, { isNew: true });
  }

  static createFromCard(card: CharacterCardV2, image: Blob): Character {
    return new this({
      id: uuid(),
      createdAt: new Date(),
      name: card.data.name || "",
      description: card.data.description || "",
      scenario: card.data.scenario || "",
      personality: card.data.personality || "",
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
  clone() {
    const characterStorageItem = _cloneDeep(this.serialize());
    characterStorageItem.id = uuid();
    characterStorageItem.createdAt = new Date();
    return new Character(characterStorageItem, { isNew: true });
  }

  private serialize(): CharacterStorageItem {
    return {
      id: this.id,
      createdAt: this.createdAt,
      name: this.name,
      description: this.description,
      personality: this.personality,
      scenario: this.scenario,
      greetings: toJS(this.greetings),
      image: this.image,
      card: this.card ? toJS(this.card) : null,
    };
  }
}