import { IDBPDatabase } from "idb";
import { BaseStorage } from "./baseStorage/BaseStorage.ts";
import { assistantMessageStorage } from "src/storages/AssistantMessageStorage.ts";

export type AssistantChatStorageItem = {
  id: string;
  createdAt: Date;
  name: string;
  generationSettings: AssistantSettings | null;
}

class AssistantChatsStorage extends BaseStorage<AssistantChatStorageItem> {
  slug = "assistantChats";
  migrations = [
    (db: IDBPDatabase) => {
      const store = db.createObjectStore(this.slug, { keyPath: "id" });
      store.createIndex("createdAt", "createdAt");
    },
  ];

  async removeItem(id: string) {
    const messages = await assistantMessageStorage.getChatItems(id);
    await Promise.all([
      ...messages.map(message => assistantMessageStorage.removeItem(message.id)),
      super.removeItem(id),
    ]);
  }
}

export const assistantChatsStorage = new AssistantChatsStorage();
