import { IndexedDBStorage } from "src/helpers/IndexedDBStorage.ts";
import { IDBPDatabase } from "idb";
import { CharacterCardV2 } from "src/helpers/validateCharacterCard.ts";

export type CharacterStorageItem = {
  id: string;
  createdAt: Date;
  name: string;
  description: string;
  personality: string;
  scenario: string;
  greetings: string[]
  image: Blob | null;
  card: CharacterCardV2 | null;
}

class CharactersStorage extends IndexedDBStorage<CharacterStorageItem> {
  dbName = "characters";
  storeName = "characters";
  migrations = [
    (db: IDBPDatabase) => {
      const store = db.createObjectStore(this.storeName, { keyPath: "id" });
      store.createIndex("createdAt", "createdAt");
    },
  ];

  async getItems() {
    const store = await this.getStore();
    const index = store.index("createdAt");
    const cursor = await index.openCursor(null, "prev");
    return this.extractCursorData(cursor);
  }
}

export const charactersStorage = new CharactersStorage();
