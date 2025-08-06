import { IndexedDBStorage } from "src/helpers/IndexedDBStorage.ts";
import { IDBPDatabase } from "idb";
import { LoreBookStrategy } from "src/enums/LoreBookStrategy.ts";

export type LoreBookEntry = {
  id: string;
  name: string;
  active: boolean;
  keywords: string[];
  strategy: LoreBookStrategy;
  position: string;
  depth: number | null;
  content: string;
}

export type LoreBookStorageItem = {
  id: string;
  createdAt: Date;
  name: string;
  depth: number;
  entries: LoreBookEntry[];
}

class LoreBookStorage extends IndexedDBStorage<LoreBookStorageItem> {
  dbName = "loreBooks";
  storeName = "loreBooks";
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

export const loreBookStorage = new LoreBookStorage();
