import { action, makeObservable, observable, when } from "mobx";
import { Chat } from "src/store/Chat.ts";
import { chatsStorage } from "src/storages/ChatsStorage.ts";
import { ChatMessageStorageItem, messageStorage } from "src/storages/MessageStorage.ts";
import { requestStorage } from "src/storages/RequestStorage.ts";
import { charactersManager } from "src/store/CharactersManager.ts";
import { flowsManager } from "src/store/FlowsManager.ts";

export class ChatsManager {
  @observable chats: string[] = [];
  @observable chatsDict: Record<string, Chat> = {};
  @observable ready = false;

  constructor() {
    makeObservable(this);

    Promise.all([
      when(() => charactersManager.ready),
    ]).then(() => chatsStorage.getItems())
      .then(action((data) => {
        const list: string[] = [];
        const dict: Record<string, Chat> = {};
        data.forEach(item => {
          list.push(item.id);

          if ("characterId" in item) {
            const character = charactersManager.charactersDict[item.characterId as string].serialize();
            item.characters = [{ character, active: true }];
            delete item.characterId;
          }
          if ("flowId" in item) {
            item.flow = flowsManager.flowsDict[item.flowId as string]?.serialize() || null;
            delete item.flowId;
          }

          dict[item.id] = new Chat(item);
        });
        this.chats = list;
        this.chatsDict = dict;
        this.ready = true;
      }));
  }

  @action
  add(chat: Chat) {
    this.chats.unshift(chat.id);
    this.chatsDict[chat.id] = chat;
    chat.save();
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