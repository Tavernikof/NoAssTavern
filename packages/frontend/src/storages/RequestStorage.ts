import { BaseStorage } from "./baseStorage/BaseStorage.ts";
import { IDBPDatabase } from "idb";
import { BackendProvider } from "src/enums/BackendProvider.ts";

export type RequestStorageItem = {
  id: string,
  createdAt: Date,
  provider: BackendProvider
  response: BackendProviderGenerateResponse
}

class RequestStorage extends BaseStorage<RequestStorageItem> {
  slug = "requests";
  migrations = [
    (db: IDBPDatabase) => {
      const store = db.createObjectStore(this.slug, { keyPath: "id" });
      store.createIndex("createdAt", "createdAt");
    },
  ];
}

export const requestStorage = new RequestStorage();
