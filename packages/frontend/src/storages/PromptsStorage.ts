import { BaseStorage } from "./baseStorage/BaseStorage.ts";
import { IDBPDatabase } from "idb";
import { BackendProvider } from "src/enums/BackendProvider.ts";
import { CodeBlockStorageItem } from "src/storages/CodeBlocksStorage.ts";
import { MediaFile } from "src/storages/MediaFile.ts";
import { collectPromptMedia, deleteSnapshot } from "src/helpers/collectMediaIds.ts";

export type PromptCodeBlockStorageItem = {
  active: boolean;
  codeBlock: CodeBlockStorageItem;
}

export type PromptStorageItem = {
  id: string;
  name: string;
  createdAt: Date;
  blocks: (PromptMessageBlock | PromptHistoryBlock)[];
  backendProviderId: BackendProvider;
  connectionProxyId: string | null;
  model: string;
  generationConfig: PromptGenerationConfig;
  codeBlocks: PromptCodeBlockStorageItem[];
  mediaFiles?: MediaFile[];
}

class PromptsStorage extends BaseStorage<PromptStorageItem> {
  slug = "prompts";
  migrations = [
    (db: IDBPDatabase) => {
      const store = db.createObjectStore(this.slug, { keyPath: "id" });
      store.createIndex("createdAt", "createdAt");
    },
  ];

  async removeItem(id: string) {
    const prompt = await this.getItem(id).catch(() => null);
    if (prompt) await deleteSnapshot(collectPromptMedia(prompt));
    await super.removeItem(id);
  }
}

export const promptStorage = new PromptsStorage();
