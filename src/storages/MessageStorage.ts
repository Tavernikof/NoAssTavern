import { IndexedDBStorage } from "../helpers/IndexedDBStorage.ts";
import { IDBPDatabase } from "idb";

export type ChatMessageStorageItem = {
  id: string,
  chatId: string,
  createdAt: Date,
  role: import("src/enums/ChatManagerRole.ts").ChatMessageRole,
  activeSwipe: number,
  swipes: ChatSwipe[],
}

class MessageStorage extends IndexedDBStorage<ChatMessageStorageItem> {
  dbName = "messages";
  storeName = "messages";
  migrations = [
    (db: IDBPDatabase) => {
      const messagesStore = db.createObjectStore(this.storeName, { keyPath: "id" });
      messagesStore.createIndex("createdAt", ["chatId", "createdAt"]);
    },
  ];

  async getItems(chatId: string) {
    const store = await this.getStore();
    const index = store.index("createdAt");
    const cursor = await index.openCursor(IDBKeyRange.bound(
      [chatId, new Date(0)],
      [chatId, new Date(Date.now() + 8640000000000)],
    ));
    return this.extractCursorData(cursor);
  }
}

export const messageStorage = new MessageStorage();
