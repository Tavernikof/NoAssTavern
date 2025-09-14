import { BaseStorage } from "./baseStorage/BaseStorage.ts";
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

class LoreBookStorage extends BaseStorage<LoreBookStorageItem> {
  slug = "loreBooks";
  migrations = [
    (db: IDBPDatabase) => {
      const store = db.createObjectStore(this.slug, { keyPath: "id" });
      store.createIndex("createdAt", "createdAt");
    },
  ];
}

export const loreBookStorage = new LoreBookStorage();
