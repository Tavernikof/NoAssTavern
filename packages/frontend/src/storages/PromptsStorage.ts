import { BaseStorage } from "./baseStorage/BaseStorage.ts";
import { IDBPDatabase } from "idb";
import { BackendProvider } from "src/enums/BackendProvider.ts";

export type PromptStorageItem = {
  id: string;
  name: string;
  createdAt: Date;
  blocks: PromptBlock[];
  backendProviderId: BackendProvider;
  connectionProxyId: string | null;
  model: string;
  generationConfig: PromptGenerationConfig;
}

class PromptsStorage extends BaseStorage<PromptStorageItem> {
  slug = "prompts";
  migrations = [
    (db: IDBPDatabase) => {
      const store = db.createObjectStore(this.slug, { keyPath: "id" });
      store.createIndex("createdAt", "createdAt");
    },
  ];
}

export const promptStorage = new PromptsStorage();
