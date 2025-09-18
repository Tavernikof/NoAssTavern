import { BaseStorage } from "./baseStorage/BaseStorage.ts";
import { IDBPDatabase } from "idb";
import { LoreBookStrategy } from "src/enums/LoreBookStrategy.ts";
import { LoreBookConditionType } from "src/enums/LoreBookConditionType.ts";

export type LoreBookCondition = {
  type: LoreBookConditionType;
  keywords: string[];
}

export type LoreBookEntry = {
  id: string;
  name: string;
  active: boolean;
  conditions: LoreBookCondition[];
  strategy: LoreBookStrategy;
  position: string; // keyword for insertion template
  depth: number | null; // how many messages to scan
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
