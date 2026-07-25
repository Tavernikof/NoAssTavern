import { BaseStorage } from "./baseStorage/BaseStorage.ts";
import { IDBPDatabase } from "idb";
import { BackendProvider } from "src/enums/BackendProvider.ts";

export type GenerationPresetStorageItem = {
  id: string,
  createdAt: Date,
  name: string,
  backendProviderId: BackendProvider,
  connectionProxyId: string | null,
  model: string,
  generationConfig: PromptGenerationConfig,
}

class GenerationPresetsStorage extends BaseStorage<GenerationPresetStorageItem> {
  slug = "generationPresets";
  migrations = [
    (db: IDBPDatabase) => {
      const store = db.createObjectStore(this.slug, { keyPath: "id" });
      store.createIndex("createdAt", "createdAt");
    },
  ];
}

export const generationPresetsStorage = new GenerationPresetsStorage();
