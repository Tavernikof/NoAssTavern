import { when } from "mobx";
import { Chat } from "src/store/Chat.ts";
import { chatsStorage, ChatStorageItem } from "src/storages/ChatsStorage.ts";
import { charactersManager } from "src/store/CharactersManager.ts";
import { flowsManager } from "src/store/FlowsManager.ts";
import { AbstractManager } from "src/helpers/AbstractManager.ts";

export class ChatsManager extends AbstractManager<Chat, ChatStorageItem> {
  constructor() {
    super(chatsStorage, Chat);
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
}

export const chatsManager = new ChatsManager();
window.chatsManager = chatsManager;