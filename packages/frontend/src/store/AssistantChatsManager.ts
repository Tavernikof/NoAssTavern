import { AbstractManager } from "src/helpers/AbstractManager.ts";
import { assistantChatsStorage, AssistantChatStorageItem } from "src/storages/AssistantChatsStorage.ts";
import { AssistantChat } from "src/store/AssistantChat.ts";

export class AssistantChatsManager extends AbstractManager<AssistantChat, AssistantChatStorageItem> {
  constructor() {
    super(assistantChatsStorage, AssistantChat);
  }

  getLabel(entity: AssistantChat): string {
    return entity.name;
  }
}

export const assistantChatsManager = new AssistantChatsManager();
window.assistantChatsManager = assistantChatsManager;