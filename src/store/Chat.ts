import { action, autorun, makeObservable, observable } from "mobx";
import { chatsStorage, ChatStorageItem } from "src/storages/ChatsStorage.ts";
import { Character } from "src/store/Character.ts";
import { Flow } from "src/store/Flow.ts";
import { v4 as uuid } from "uuid";
import { LoreBook } from "src/store/LoreBook.ts";

type ChatCreateConfig = {
  isNew?: boolean
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

    makeObservable(this);

    autorun(() => {
      if (this.isNew) return;
      const object = this.serialize();
      chatsStorage.updateItem(object);
    });
  }

  static createEmpty(data: Omit<ChatStorageItem, "id" | "createdAt">): Chat {
    return new this({
      id: uuid(),
      createdAt: new Date(),
      ...data,
    }, { isNew: true });
  }

  @action
  update(chatContent: Partial<ChatStorageItem>) {
    for (const field in chatContent) {
      const data = chatContent[field as keyof ChatStorageItem];
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
  }

  private serialize(): ChatStorageItem {
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
    };
  }
}