import { IDBPDatabase } from "idb";
import { CharacterCardV2 } from "src/helpers/validateCharacterCard.ts";
import { LoreBookStorageItem } from "./LoreBookStorage.ts";
import { BaseStorage } from "./baseStorage/BaseStorage.ts";
import { imagesStorage } from "src/storages/ImagesStorage.ts";

export type CharacterStorageItem = {
  id: string;
  createdAt: Date;
  name: string;
  description: string;
  scenario: string;
  greetings: string[];
  loreBook: LoreBookStorageItem | null;
  imageId: string | null;
  card: CharacterCardV2 | null;
}

class CharactersStorage extends BaseStorage<CharacterStorageItem> {
  slug = "characters";
  migrations = [
    (db: IDBPDatabase) => {
      const store = db.createObjectStore(this.slug, { keyPath: "id" });
      store.createIndex("createdAt", "createdAt");
    },
  ];

  async removeItem(id: string) {
    const character = await this.getItem(id);
    if (!character) return;
    if (character.imageId) await imagesStorage.removeItem(character.imageId);
    return super.removeItem(id);
  }
}

export const charactersStorage = new CharactersStorage();
