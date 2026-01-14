import { BaseStorage } from "./baseStorage/BaseStorage.ts";
import { IDBPDatabase } from "idb";
import { BackendProvider } from "src/enums/BackendProvider.ts";
import { CodeBlockStorageItem } from "src/storages/CodeBlocksStorage.ts";

export type PromptCodeBlockStorageItem = {
  active: boolean;
  codeBlock: CodeBlockStorageItem;
}

export type PromptStorageItem = {
  id: string;
  name: string;
  createdAt: Date;
  blocks: PromptBlock[];
  backendProviderId: BackendProvider;
  connectionProxyId: string | null;
  model: string;
  generationConfig: PromptGenerationConfig;
  codeBlocks: PromptCodeBlockStorageItem[]
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
