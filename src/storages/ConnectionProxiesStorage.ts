import { IndexedDBStorage } from "src/helpers/IndexedDBStorage.ts";
import { IDBPDatabase } from "idb";

export type ConnectionProxyStorageItem = {
  id: string,
  createdAt: Date,
  name: string,
  baseUrl: string,
  key: string,
  modelsEndpoint: string,
  models: string[] | null,
}

class ConnectionProxiesStorage extends IndexedDBStorage<ConnectionProxyStorageItem> {
  dbName = "connectionProxies";
  storeName = "connectionProxies";
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

export const connectionProxiesStorage = new ConnectionProxiesStorage();
