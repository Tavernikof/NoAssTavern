import { action, makeObservable, observable } from "mobx";
import { Chat } from "src/store/Chat.ts";
import { chatsStorage } from "src/storages/ChatsStorage.ts";
import { v4 as uuid } from "uuid";
import { ChatMessageStorageItem, messageStorage } from "src/storages/MessageStorage.ts";
import { requestStorage } from "src/storages/RequestStorage.ts";

export class ChatsManager {
  @observable chats: string[] = [];
  @observable chatsDict: Record<string, Chat> = {};

  constructor() {
    makeObservable(this);

    chatsStorage.getItems().then(action((data) => {
      const list: string[] = [];
      const dict: Record<string, Chat> = {};
      data.forEach(item => {
        list.push(item.id);
        dict[item.id] = new Chat(item);
      });
      this.chats = list;
      this.chatsDict = dict;
    }));
  }

  @action
  create(data: { characterId: string, personaId: string, flowId: string }) {
    const chat = new Chat({
      id: uuid(),
      createdAt: new Date(),
      characterId: data.characterId,
      personaId: data.personaId,
      flowId: data.flowId,
    });
    this.chats.unshift(chat.id);
    this.chatsDict[chat.id] = chat;
    return chat;
  }

  @action
  async remove(chat: Chat) {
    this.chats = this.chats.filter(chatId => chatId !== chat.id);
    delete this.chatsDict[chat.id];
    const messages = await messageStorage.getItems(chat.id);
    await Promise.all([
      ...messages.map(message => this.removeMessage(message)),
      chatsStorage.removeItem(chat.id),
    ]);
  }

  async removeMessage(message: ChatMessageStorageItem) {
    await messageStorage.removeItem(message.id);
    message.swipes.forEach(swipe => {
      for (const promptKey in swipe.prompts) {
        const requestId = swipe.prompts[promptKey].requestId;
        if (requestId) requestStorage.removeItem(requestId);
      }
    });
  }
}

export const chatsManager = new ChatsManager();