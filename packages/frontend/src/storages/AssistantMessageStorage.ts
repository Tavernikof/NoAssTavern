import { IDBPDatabase } from "idb";
import { BaseStorage } from "./baseStorage/BaseStorage.ts";
import { IndexedDBStorage } from "src/storages/baseStorage/IndexedDBStorage.ts";
import { backendManager } from "src/store/BackendManager.ts";
import { requestStorage } from "src/storages/RequestStorage.ts";
import { Entry, ZipWriter } from "@zip.js/zip.js";
import parseJSON from "src/helpers/parseJSON.ts";
import { assistantChatsStorage } from "src/storages/AssistantChatsStorage.ts";

export type AssistantMessageStorageItem = {
  id: string,
  assistantChatId: string,
  createdAt: Date,
  role: import("src/enums/ChatManagerRole.ts").ChatMessageRole,
  activeSwipe: number,
  swipes: ChatSwipe[],
}

class AssistantMessageStorage extends BaseStorage<AssistantMessageStorageItem> {
  slug = "assistantMessages";
  migrations = [
    (db: IDBPDatabase) => {
      const messagesStore = db.createObjectStore(this.slug, { keyPath: "id" });
      messagesStore.createIndex("createdAt", ["chatId", "createdAt"]);
    },
  ];

  async getChatItems(assistantChatId: string) {
    const storage = this.getStorage();
    if (storage instanceof IndexedDBStorage) {
      const store = await storage.getStore();
      const index = store.index("createdAt");
      const cursor = await index.openCursor(IDBKeyRange.bound(
        [assistantChatId, new Date(0)],
        [assistantChatId, new Date(Date.now() + 8640000000000)],
      ));
      return storage.extractCursorData(cursor);
    }

    return backendManager.apiRequest<AssistantMessageStorageItem[]>({
      method: "get",
      url: `storage/${assistantChatsStorage.slug}/${assistantChatId}/${this.slug}`,
    }).then(resp => resp.data);
  }

  async removeItem(id: string) {
    const message = await this.getItem(id);
    if (!message) return;
    message.swipes.forEach(swipe => {
      for (const promptKey in swipe.prompts) {
        if (!swipe.prompts[promptKey]) continue;
        const requestId = swipe.prompts[promptKey].requestId;
        if (requestId) requestStorage.removeItem(requestId);
      }
    });
    return super.removeItem(id);
  }

  async importEntry(entry: Entry) {
    const regExp = new RegExp(`${assistantChatsStorage.slug}/[a-zA-Z0-9\\-]+/${this.slug}/([a-zA-Z0-9\\-]+)\\.[a-zA-Z0-9]+`, "");
    const match = entry.filename.match(regExp);
    if (!match || !entry.getData) return false;
    const textWriter = new (await import("@zip.js/zip.js")).TextWriter();
    const data = await entry.getData(textWriter);
    const entity = parseJSON(data);
    if (!entity) return false;
    if (typeof entity.createdAt === "string") entity.createdAt = new Date(entity.createdAt);
    await this.updateItem(entity);
    return true;
  }

  async archiveEntry(item: AssistantMessageStorageItem, zipWriter: ZipWriter<any>) {
    const json = JSON.stringify(item, null, 2);
    const textReader = new (await import("@zip.js/zip.js")).TextReader(json);
    return zipWriter.add(`${assistantChatsStorage.slug}/${item.assistantChatId}/${this.slug}/${item.id}.json`, textReader);
  }
}

export const assistantMessageStorage = new AssistantMessageStorage();
