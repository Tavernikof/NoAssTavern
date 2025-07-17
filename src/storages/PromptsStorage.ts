import { IndexedDBStorage } from "src/helpers/IndexedDBStorage.ts";
import { IDBPDatabase } from "idb";
import { BackendProvider } from "src/enums/BackendProvider.ts";

export type PromptStorageItem = {
  id: string;
  name: string;
  createdAt: Date;
  blocks: PromptBlock[];
  backendProviderId: BackendProvider;
  connectionProxyId: string | null;
  generationConfig: PromptGenerationConfig;
}

class PromptsStorage extends IndexedDBStorage<PromptStorageItem> {
  dbName = "prompts";
  storeName = "prompts";
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

export const promptStorage = new PromptsStorage();
