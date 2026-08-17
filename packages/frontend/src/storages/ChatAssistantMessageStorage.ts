import type { Entry, ZipWriter } from "@zip.js/zip.js";
import { IDBPDatabase } from "idb";
import { BaseStorage } from "src/storages/baseStorage/BaseStorage.ts";
import { IndexedDBStorage } from "src/storages/baseStorage/IndexedDBStorage.ts";
import { backendManager } from "src/store/BackendManager.ts";
import { globalSettings } from "src/store/GlobalSettings.ts";
import { requestStorage } from "src/storages/RequestStorage.ts";
import { filesStorage } from "src/storages/FilesStorage.ts";
import parseJSON from "src/helpers/parseJSON.ts";

export type ChatAssistantMessageStorageItem = {
  id: string;
  chatId: string;
  assistantChatId: string;
  createdAt: Date;
  role: import("src/enums/ChatManagerRole.ts").ChatMessageRole;
  activeSwipe: number;
  swipes: ChatSwipe[];
}

class ChatAssistantMessageStorage extends BaseStorage<ChatAssistantMessageStorageItem> {
  slug = "chatAssistantMessages";
  migrations = [
    (db: IDBPDatabase) => {
      const store = db.createObjectStore(this.slug, { keyPath: "id" });
      store.createIndex("createdAt", ["chatId", "assistantChatId", "createdAt"]);
    },
  ];

  async getChatItems(chatId: string, assistantChatId: string) {
    const storage = this.getStorage();
    if (storage instanceof IndexedDBStorage) {
      const store = await storage.getStore();
      const index = store.index("createdAt");
      const cursor = await index.openCursor(IDBKeyRange.bound(
        [chatId, assistantChatId, new Date(0)],
        [chatId, assistantChatId, new Date(Date.now() + 8640000000000)],
      ));
      return storage.extractCursorData(cursor);
    }

    return backendManager.apiRequest<ChatAssistantMessageStorageItem[]>({
      method: "GET",
      url: this.getMessagesUrl(chatId, assistantChatId),
    }).then(response => response.data);
  }

  async updateItem(value: ChatAssistantMessageStorageItem) {
    if (!globalSettings.isBackendEnabled) return super.updateItem(value);
    return backendManager.apiRequest<ChatAssistantMessageStorageItem>({
      method: "POST",
      url: this.getMessagesUrl(value.chatId, value.assistantChatId),
      data: value,
    }).then(response => response.data);
  }

  async removeItem(id: string, chatId?: string, assistantChatId?: string) {
    let message: ChatAssistantMessageStorageItem | undefined;
    if (!globalSettings.isBackendEnabled) {
      message = await super.getItem(id);
    } else if (chatId && assistantChatId) {
      message = await backendManager.apiRequest<ChatAssistantMessageStorageItem>({
        method: "GET",
        url: `${this.getMessagesUrl(chatId, assistantChatId)}/${id}`,
      }).then(response => response.data).catch(() => undefined);
    }
    if (!message) return;

    await this.removeMessageResources(message);

    if (!globalSettings.isBackendEnabled) return super.removeItem(id);
    return backendManager.apiRequest({
      method: "DELETE",
      url: `${this.getMessagesUrl(message.chatId, message.assistantChatId)}/${id}`,
    }).then(response => response.data);
  }

  async removeAssistantChatItems(chatId: string, assistantChatId: string) {
    const messages = await this.getChatItems(chatId, assistantChatId);
    await Promise.all(messages.map(message => this.removeItem(message.id, chatId, assistantChatId)));
  }

  async removeChatItems(chatId: string) {
    if (globalSettings.isBackendEnabled) return;
    const items = await super.getItems();
    await Promise.all(items
      .filter(item => item.chatId === chatId)
      .map(item => this.removeItem(item.id, item.chatId, item.assistantChatId)));
  }

  async importEntry(entry: Entry) {
    const match = entry.filename.match(
      /chats\/([a-zA-Z0-9-]+)\/assistantChats\/([a-zA-Z0-9-]+)\/messages\/([a-zA-Z0-9-]+)\.[a-zA-Z0-9]+/,
    );
    if (!match || !entry.getData) return false;
    const { TextWriter } = await import("@zip.js/zip.js");
    const data = await entry.getData(new TextWriter());
    const entity = parseJSON(data) as ChatAssistantMessageStorageItem | null;
    if (!entity) return false;
    if (typeof entity.createdAt === "string") entity.createdAt = new Date(entity.createdAt);
    await this.updateItem(entity);
    return true;
  }

  async archiveEntry(item: ChatAssistantMessageStorageItem, zipWriter: ZipWriter<unknown>) {
    const { TextReader } = await import("@zip.js/zip.js");
    const path = `chats/${item.chatId}/assistantChats/${item.assistantChatId}/messages/${item.id}.json`;
    return zipWriter.add(path, new TextReader(JSON.stringify(item, null, 2)));
  }

  private getMessagesUrl(chatId: string, assistantChatId: string) {
    return `storage/chats/${chatId}/assistantChats/${assistantChatId}/messages`;
  }

  private async removeMessageResources(message: ChatAssistantMessageStorageItem) {
    const operations: Promise<unknown>[] = [];
    message.swipes.forEach(swipe => {
      Object.values(swipe.prompts).forEach(prompt => {
        if (prompt?.requestId) operations.push(requestStorage.removeItem(prompt.requestId));
        if (Array.isArray(prompt?.images)) {
          prompt.images.forEach(image => operations.push(filesStorage.removeItem(image.imageId)));
        }
      });
    });
    await Promise.all(operations);
  }
}

export const chatAssistantMessageStorage = new ChatAssistantMessageStorage();
