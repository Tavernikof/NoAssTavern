import { IndexedDBStorage } from "src/helpers/IndexedDBStorage.ts";
import { IDBPDatabase } from "idb";
import { BackendProvider } from "src/enums/BackendProvider.ts";

export type RequestStorageItem = {
  id: string,
  createdAt: Date,
  provider: BackendProvider
  response: BackendProviderGenerateResponse
}

class RequestStorage extends IndexedDBStorage<RequestStorageItem> {
  dbName = "request";
  storeName = "request";
  migrations = [
    (db: IDBPDatabase) => {
      const store = db.createObjectStore(this.storeName, { keyPath: "id" });
      store.createIndex("createdAt", "createdAt");
    },
  ];

  async getItem(promptId: string): Promise<RequestStorageItem> {
    const db = await this.getDB();
    return db.get(this.storeName, promptId);
  }
}

export const requestStorage = new RequestStorage();
