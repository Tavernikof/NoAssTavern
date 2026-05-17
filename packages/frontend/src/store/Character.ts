import { action, computed, makeObservable, observable, reaction, toJS } from "mobx";
import { charactersStorage, CharacterStorageItem } from "src/storages/CharactersStorage.ts";
import { v4 as uuid } from "uuid";
import { CharacterCardV2 } from "src/helpers/validateCharacterCard.ts";
import _cloneDeep from "lodash/cloneDeep";
import { LoreBook } from "src/store/LoreBook.ts";
import { LoreBookStorageItem } from "src/storages/LoreBookStorage.ts";
import { filesManager } from "src/store/FilesManager.ts";

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
  @observable.ref loreBook: LoreBook | null;
  @observable imageId: string;
  @observable mediaFiles: MediaFile[] = [];

  card: CharacterCardV2 | null;

  @observable isNew: boolean;
  local: boolean;

  constructor(card: CharacterStorageItem, config?: CharacterCreateConfig) {
    this.isNew = config?.isNew ?? false;
    this.local = config?.local ?? false;
    const { loreBook, ...restCard } = card;
    this.update(restCard);
    this.parseLoreBook(loreBook);

    // migrate image old card
    const oldImage = (this as any).image as Blob | null;
    if (oldImage && oldImage instanceof Blob) {
      filesManager.saveBlob(oldImage, "avatar.png", oldImage.type || "image/png").then((imageId) => {
        this.imageId = imageId;
      });
    }

    makeObservable(this);

    if (!this.local) {
      reaction(() => [this.serialize(), this.isNew] as const, ([object, isNew]) => {
        if (isNew) return;
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
      loreBook: null,
      card: null,
      imageId: null,
      mediaFiles: [],
    }, { isNew: true });
  }

  static async createFromCard(card: CharacterCardV2, blob: Blob) {
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
      loreBook: null,
      card,
      imageId: await filesManager.saveBlob(blob, "avatar.png", blob.type || "image/png"),
      mediaFiles: [],
    }, { isNew: true });
  }

  @computed
  get avatar() {
    const { imageId } = this;
    if (!imageId) return null;
    return {
      id: imageId,
      name: this.name,
      mimeType: "image",
      size: -1,
      createdAt: new Date(),
    } as MediaFile;
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
    if (this.imageId) filesManager.saveTempItem(this.imageId);
    this.mediaFiles.forEach(file => filesManager.saveTempItem(file.id));
  }

  @action
  clone(local?: boolean) {
    const characterStorageItem = _cloneDeep(this.serialize());
    characterStorageItem.id = uuid();
    characterStorageItem.createdAt = new Date();
    if (this.loreBook) characterStorageItem.loreBook = this.loreBook.clone().serialize();
    if (characterStorageItem.imageId) characterStorageItem.imageId = filesManager.cloneItem(characterStorageItem.imageId);
    if (characterStorageItem.mediaFiles?.length) {
      characterStorageItem.mediaFiles = characterStorageItem.mediaFiles.map(item => ({
        ...item,
        id: filesManager.cloneItem(item.id),
      }));
    }
    return new Character(characterStorageItem, { isNew: true, local });
  }

  @action.bound
  initLoreBook() {
    this.loreBook = LoreBook.createEmpty(this);
  }

  serialize(): CharacterStorageItem {
    return {
      id: this.id,
      createdAt: this.createdAt,
      name: this.name,
      description: this.description,
      scenario: this.scenario,
      greetings: toJS(this.greetings),
      imageId: this.imageId || null,
      loreBook: this.loreBook?.serialize() || null,
      card: this.card ? toJS(this.card) : null,
      mediaFiles: toJS(this.mediaFiles) || [],
    };
  }

  private parseLoreBook(loreBook: LoreBookStorageItem | null) {
    if (loreBook) {
      this.loreBook = new LoreBook(loreBook, { local: true, parentCharacter: this });
      return;
    }
    const characterBook = this.card?.data?.character_book;
    if (!characterBook) return;
    this.loreBook = LoreBook.createFromCharacterBook({ characterBook, config: { local: true, parentCharacter: this } });
  }
}