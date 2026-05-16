import { IDBPDatabase } from "idb";
import { CharacterStorageItem } from "src/storages/CharactersStorage.ts";
import { FlowStorageItem } from "src/storages/FlowsStorage.ts";
import { LoreBookStorageItem } from "src/storages/LoreBookStorage.ts";
import { BaseStorage } from "./baseStorage/BaseStorage.ts";
import { messageStorage } from "src/storages/MessageStorage.ts";
import { MediaFile } from "src/storages/MediaFile.ts";
import { collectChatMedia, deleteSnapshot } from "src/helpers/collectMediaIds.ts";

export type ChatStorageItem = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  scenario: string;
  characters: {
    character: CharacterStorageItem;
    active: boolean;
  }[];
  persona: string | null;
  loreBooks: {
    loreBook: LoreBookStorageItem,
    active: boolean;
  }[];
  impersonate: string | null;
  impersonateHistory: string[] | null;
  flow: FlowStorageItem;
  variables: Record<string, string>;
  mediaFiles?: MediaFile[];
}

class ChatsStorage extends BaseStorage<ChatStorageItem> {
  slug = "chats";
  migrations = [
    (db: IDBPDatabase) => {
      const store = db.createObjectStore(this.slug, { keyPath: "id" });
      store.createIndex("createdAt", "createdAt");
    },
  ];

  async removeItem(id: string) {
    const chat = await this.getItem(id).catch(() => null);
    const messages = await messageStorage.getChatItems(id);
    await Promise.all(messages.map(message => messageStorage.removeItem(message.id)));
    if (chat) await deleteSnapshot(collectChatMedia(chat));
    await super.removeItem(id);
  }
}

export const chatsStorage = new ChatsStorage();
