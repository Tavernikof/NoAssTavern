import { IndexedDBStorage } from "src/helpers/IndexedDBStorage.ts";
import { IDBPDatabase } from "idb";

export type PersonaStorageItem = {
  id: string,
  createdAt: Date,
  name: string,
  description: string,
}

class PersonasStorage extends IndexedDBStorage<PersonaStorageItem> {
  dbName = "personas";
  storeName = "personas";
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

export const personasStorage = new PersonasStorage();
