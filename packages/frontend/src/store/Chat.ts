import { action, autorun, makeObservable, observable, reaction } from "mobx";
import { chatsStorage, ChatStorageItem } from "src/storages/ChatsStorage.ts";
import { Character } from "src/store/Character.ts";
import { Flow } from "src/store/Flow.ts";
import { v4 as uuid } from "uuid";
import { LoreBook } from "src/store/LoreBook.ts";
import { imagesStorage } from "src/storages/ImagesStorage.ts";

type ChatCreateConfig = {
  isNew?: boolean
}

export type ChatUpdateDto = Omit<ChatStorageItem, "id" | "createdAt" | "characters" | "loreBooks" | "flow"> & {
  characters: { character: Character, active: boolean }[],
  loreBooks: { loreBook: LoreBook, active: boolean }[],
  flow: Flow,
}

export class Chat {
  @observable id: string;
  @observable createdAt: Date;
  @observable name: string;
  @observable scenario: string;
  @observable characters: ChatCharacter[];
  @observable loreBooks: ChatLoreBook[];
  @observable persona: string | null;
  @observable impersonate: string | null;
  @observable flow: Flow;
  variables: Record<string, string> = {};

  @observable isNew: boolean;

  constructor(data: ChatStorageItem, config?: ChatCreateConfig) {
    this.isNew = config?.isNew ?? false;

    this.id = data.id;
    this.name = data.name;
    this.scenario = data.scenario;
    this.createdAt = data.createdAt;
    this.characters = data.characters.map(item => ({
      ...item,
      character: new Character(item.character, { local: true }),
    }));
    this.loreBooks = data.loreBooks?.map(item => ({
      ...item,
      loreBook: new LoreBook(item.loreBook, { local: true }),
    })) || [];
    this.persona = data.persona;
    this.impersonate = data.impersonate;
    this.flow = new Flow(data.flow, { local: true });
    this.variables = data.variables ?? {};

    makeObservable(this);

    reaction(() => [this.serialize(), this.isNew] as const, ([object]) => {
      chatsStorage.updateItem(object);
    });

    reaction(() => this.characters, (characters, prevCharacters) => {
      prevCharacters.forEach((item) => {
        if (!characters.find(c => c.character.id === item.character.id)) {
          return imagesStorage.removeItem(item.character.imageId);
        }
      });
      characters.forEach(item => item.character.save());
    });
  }

  static createEmpty(data: ChatUpdateDto): Chat {
    return new this({
      id: uuid(),
      name: data.name || "",
      scenario: data.scenario || "",
      createdAt: new Date(),
      characters: data.characters?.map(item => ({ character: item.character.serialize(), active: item.active })) || [],
      loreBooks: data.loreBooks?.map(item => ({ loreBook: item.loreBook.serialize(), active: item.active })) || [],
      persona: data.persona || null,
      impersonate: data.impersonate || null,
      flow: data.flow?.serialize() || null,
      variables: {},
    }, { isNew: true });
  }

  @action
  update(chatContent: ChatUpdateDto) {
    for (const field in chatContent) {
      const data = chatContent[field as keyof ChatUpdateDto];
      // @ts-expect-error fuck ts
      if (data !== undefined) this[field] = data;
    }
  }

  @action
  updateCharacterActive(characterId: string, active: boolean) {
    const character = this.characters.find(({ character }) => character.id === characterId);
    if (character) character.active = active;
  }

  @action
  updateImpersonate(impersonate: string | null) {
    this.impersonate = impersonate;
  }

  @action
  save() {
    this.isNew = false;
    this.characters.forEach(item => item.character.save());
  }

  @action
  setVar(name: string, value: string) {
    if (this.variables[name] === value) return;
    this.variables[name] = value;
    chatsStorage.updateItem(this.serialize());
  }

  serialize(): ChatStorageItem {
    return {
      id: this.id,
      createdAt: this.createdAt,
      name: this.name,
      scenario: this.scenario,
      characters: this.characters.map(item => ({ ...item, character: item.character.serialize() })),
      loreBooks: this.loreBooks.map(item => ({ ...item, loreBook: item.loreBook.serialize() })),
      persona: this.persona,
      impersonate: this.impersonate,
      flow: this.flow.serialize(),
      variables: this.variables,
    };
  }
}