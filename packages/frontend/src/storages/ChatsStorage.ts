import { IDBPDatabase } from "idb";
import { CharacterStorageItem } from "src/storages/CharactersStorage.ts";
import { FlowStorageItem } from "src/storages/FlowsStorage.ts";
import { LoreBookStorageItem } from "src/storages/LoreBookStorage.ts";
import { BaseStorage } from "./baseStorage/BaseStorage.ts";
import { messageStorage } from "src/storages/MessageStorage.ts";
import { imagesStorage } from "src/storages/ImagesStorage.ts";

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
  loreBooks: {
    loreBook: LoreBookStorageItem,
    active: boolean;
  }[];
  impersonate: string | null;
  flow: FlowStorageItem;
  variables: Record<string, string>;
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
    const messages = await messageStorage.getChatItems(id);
    const chat = await this.getItem(id);
    await Promise.all([
      ...messages.map(message => messageStorage.removeItem(message.id)),
      ...chat.characters.map(({ character }) => {
        if (character.imageId) return imagesStorage.removeItem(character.imageId);
      }),
      super.removeItem(id),
    ]);
  }
}

export const chatsStorage = new ChatsStorage();
