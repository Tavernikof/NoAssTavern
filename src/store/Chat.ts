import { action, autorun, makeObservable, observable } from "mobx";
import { chatsStorage, ChatStorageItem } from "src/storages/ChatsStorage.ts";

export class Chat {
  @observable id: string;
  @observable createdAt: Date;
  @observable characterId: string;
  @observable personId: string;
  @observable flowId: string;

  constructor(data: ChatStorageItem) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.characterId = data.characterId;
    this.personId = data.personaId;
    this.flowId = data.flowId;

    makeObservable(this);

    autorun(() => {
      const object = this.serialize();
      chatsStorage.updateItem(object);
    });
  }

  @action
  replaceFlow(flowId: string) {
    this.flowId = flowId;
  }

  private serialize(): ChatStorageItem {
    return {
      id: this.id,
      createdAt: this.createdAt,
      characterId: this.characterId,
      personaId: this.personId,
      flowId: this.flowId,
    };
  }
}