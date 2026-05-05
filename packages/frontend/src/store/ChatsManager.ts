import { action, computed, makeObservable, observable, when } from "mobx";
import { Chat } from "src/store/Chat.ts";
import { chatsStorage, ChatStorageItem } from "src/storages/ChatsStorage.ts";
import { charactersManager } from "src/store/CharactersManager.ts";
import { flowsManager } from "src/store/FlowsManager.ts";
import { AbstractManager } from "src/helpers/AbstractManager.ts";
import { sortByCreatedAt, sortByUpdatedAt } from "src/helpers/sortBy.ts";

const SORT_KEY = "chats_manager_sort";

export class ChatsManager extends AbstractManager<Chat, ChatStorageItem> {
  @observable sort: "createdAt" | "updatedAt" = localStorage[SORT_KEY] || "createdAt";

  constructor() {
    super(chatsStorage, Chat);
    makeObservable(this);
  }

  protected async migrateEntity(item: ChatStorageItem) {
    await when(() => charactersManager.ready);
    await when(() => flowsManager.ready);
    if ("characterId" in item) {
      const character = charactersManager.dict[item.characterId as string].serialize();
      item.characters = [{ character, active: true }];
      delete item.characterId;
    }
    if ("flowId" in item) {
      item.flow = flowsManager.dict[item.flowId as string]?.serialize() || null;
      delete item.flowId;
    }
    return item;
  }

  getLabel(entity: Chat): string {
    return entity.name;
  }

  @computed
  get sortedList() {
    const newList = this.list.map(id => this.dict[id]);
    if (this.sort === "createdAt") newList.sort(sortByCreatedAt);
    if (this.sort === "updatedAt") newList.sort(sortByUpdatedAt);
    return newList.map(chat => chat.id);
  }

  @action
  setSort(sort: typeof chatsManager["sort"]) {
    localStorage[SORT_KEY] = sort;
    this.sort = sort;
  }
}

export const chatsManager = new ChatsManager();
window.chatsManager = chatsManager;