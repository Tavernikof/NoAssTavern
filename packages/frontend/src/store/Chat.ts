import { action, computed, makeObservable, observable, reaction, toJS } from "mobx";
import { chatsStorage, ChatStorageItem } from "src/storages/ChatsStorage.ts";
import { Character } from "src/store/Character.ts";
import { Flow } from "src/store/Flow.ts";
import { v4 as uuid } from "uuid";
import { LoreBook } from "src/store/LoreBook.ts";
import { MediaFile } from "src/storages/MediaFile.ts";
import { filesManager } from "src/store/FilesManager.ts";
import { parseDate } from "src/helpers/date.ts";

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
  @observable updatedAt: Date;
  @observable name: string;
  @observable scenario: string;
  @observable characters: ChatCharacter[];
  @observable loreBooks: ChatLoreBook[];
  @observable persona: string | null;
  @observable impersonate: string | null;
  @observable impersonateHistory: string[] = [];
  @observable flow: Flow;
  @observable mediaFiles: MediaFile[] = [];
  variables: Record<string, string> = {};

  @observable isNew: boolean;

  constructor(data: ChatStorageItem, config?: ChatCreateConfig) {
    this.isNew = config?.isNew ?? false;

    this.id = data.id;
    this.name = data.name;
    this.scenario = data.scenario;
    this.createdAt = parseDate(data.createdAt)!;
    this.updatedAt = parseDate(data.updatedAt) || this.createdAt;
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
    this.impersonateHistory = data.impersonateHistory || [];
    this.flow = new Flow(data.flow, { local: true });
    this.mediaFiles = data.mediaFiles || [];
    this.variables = data.variables ?? {};

    makeObservable(this);

    reaction(() => {
      const object = this.serialize(true);
      delete (object as any).updatedAt;
      return object;
    }, () => {
      this.updateUpdatedAt();
    });

    reaction(() => [this.updatedAt, this.isNew] as const, () => {
      chatsStorage.updateItem(this.serialize());
    });

    reaction(() => this.characters, (characters) => {
      characters.forEach(item => item.character.save());
    });

    reaction(() => this.flow, (flow) => {
      flow?.save();
    });
  }

  static createEmpty(data: ChatUpdateDto): Chat {
    return new this({
      id: uuid(),
      name: data.name || "",
      scenario: data.scenario || "",
      createdAt: new Date(),
      updatedAt: new Date(),
      characters: data.characters?.map(item => ({ character: item.character.serialize(), active: item.active })) || [],
      loreBooks: data.loreBooks?.map(item => ({ loreBook: item.loreBook.serialize(), active: item.active })) || [],
      persona: data.persona || null,
      impersonate: data.impersonate || null,
      impersonateHistory: data.impersonateHistory || null,
      flow: data.flow?.serialize() || null,
      variables: {},
      mediaFiles: data.mediaFiles || [],
    }, { isNew: true });
  }

  @computed
  get impersonateOptions() {
    const options: { value: string, label: string, custom?: boolean }[] = [];
    this.characters.map(c => options.push({
      value: c.character.name,
      label: c.character.name,
    }));
    this.impersonateHistory.forEach(c => options.push({
      value: c,
      label: c,
      custom: true,
    }));
    return options;
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
    if (impersonate && !this.impersonateOptions.find(o => o.value === impersonate)) {
      this.impersonateHistory.push(impersonate);
    }
    this.impersonate = impersonate;
  }

  @action
  removeImpersonate(impersonate: string) {
    const index = this.impersonateHistory.findIndex(i => i === impersonate);
    this.impersonateHistory.splice(index, 1);
  }

  @action
  save() {
    this.isNew = false;
    this.characters.forEach(item => item.character.save());
    this.flow?.save();
    this.mediaFiles.forEach(file => filesManager.saveTempItem(file.id));
  }

  @action
  setVar(name: string, value: string) {
    if (this.variables[name] === value) return;
    this.variables[name] = value;
    chatsStorage.updateItem(this.serialize());
  }

  @action
  updateUpdatedAt() {
    this.updatedAt = new Date();
  }

  serialize(omitUpdateAt?: boolean): ChatStorageItem {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: omitUpdateAt ? undefined as unknown as Date : this.updatedAt,
      name: this.name,
      scenario: this.scenario,
      characters: this.characters.map(item => ({ ...item, character: item.character.serialize() })),
      loreBooks: this.loreBooks.map(item => ({ ...item, loreBook: item.loreBook.serialize() })),
      persona: this.persona,
      impersonate: this.impersonate,
      impersonateHistory: toJS(this.impersonateHistory),
      flow: this.flow.serialize(),
      variables: this.variables,
      mediaFiles: toJS(this.mediaFiles) || [],
    };
  }
}