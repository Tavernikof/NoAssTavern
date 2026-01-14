import { BaseStorage } from "./baseStorage/BaseStorage.ts";
import { IDBPDatabase } from "idb";

export type CodeBlockStorageItem = {
  id: string;
  createdAt: Date;
  name: string;
  content: string;
}

class CodeBlocksStorage extends BaseStorage<CodeBlockStorageItem> {
  slug = "codeBlocks";
  migrations = [
    (db: IDBPDatabase) => {
      const store = db.createObjectStore(this.slug, { keyPath: "id" });
      store.createIndex("createdAt", "createdAt");
    },
  ];
}

export const codeBlocksStorage = new CodeBlocksStorage();
