import { IndexedDBStorage } from "src/helpers/IndexedDBStorage.ts";
import { IDBPDatabase } from "idb";
import { CharacterStorageItem } from "src/storages/CharactersStorage.ts";
import { FlowStorageItem } from "src/storages/FlowsStorage.ts";

export type ChatStorageItem = {
  id: string;
  createdAt: Date;
  name: string;
  scenario: string;
  characters: {
    character: CharacterStorageItem;
    active: boolean;
  }[];
  persona: string | null;
  impersonate: string | null;
  flow: FlowStorageItem;
}

class ChatsStorage extends IndexedDBStorage<ChatStorageItem> {
  dbName = "chats";
  storeName = "chats";
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

export const chatsStorage = new ChatsStorage();
