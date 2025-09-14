import { BaseStorage } from "./baseStorage/BaseStorage.ts";
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

class ConnectionProxiesStorage extends BaseStorage<ConnectionProxyStorageItem> {
  slug = "connectionProxies";
  migrations = [
    (db: IDBPDatabase) => {
      const store = db.createObjectStore(this.slug, { keyPath: "id" });
      store.createIndex("createdAt", "createdAt");
    },
  ];
}

export const connectionProxiesStorage = new ConnectionProxiesStorage();
