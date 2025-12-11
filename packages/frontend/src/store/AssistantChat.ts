import { action, makeObservable, observable, reaction } from "mobx";
import { assistantChatsStorage, AssistantChatStorageItem } from "src/storages/AssistantChatsStorage.ts";

type AssistantChatCreateConfig = {
  isNew?: boolean
}

export type AssistantChatUpdateDto = Omit<AssistantChatStorageItem, "id" | "createdAt">;

export class AssistantChat {
  @observable id: string;
  @observable createdAt: Date;
  @observable name: string;
  @observable.ref generationSettings: AssistantSettings | null;

  @observable isNew: boolean;

  constructor(data: AssistantChatStorageItem, config?: AssistantChatCreateConfig) {
    this.isNew = config?.isNew ?? false;

    this.id = data.id;
    this.name = data.name;
    this.createdAt = data.createdAt;
    this.generationSettings = data.generationSettings;

    makeObservable(this);

    reaction(() => [this.serialize(), this.isNew] as const, ([object]) => {
      assistantChatsStorage.updateItem(object);
    });
  }

  // static createEmpty(data: AssistantChatUpdateDto): AssistantChat {
  //   return new this({
  //     id: uuid(),
  //     name: data.name || "",
  //     createdAt: new Date(),
  //     backendProviderId: data.backendProviderId,
  //     connectionProxyId: null,
  //     model: null,
  //     generationConfig: {},
  //   }, { isNew: true });
  // }

  @action
  update(chatContent: AssistantChatUpdateDto) {
    for (const field in chatContent) {
      const data = chatContent[field as keyof AssistantChatUpdateDto];
      // @ts-expect-error fuck ts
      if (data !== undefined) this[field] = data;
    }
  }

  @action
  save() {
    this.isNew = false;
  }

  serialize(): AssistantChatStorageItem {
    return {
      id: this.id,
      createdAt: this.createdAt,
      name: this.name,
      generationSettings: this.generationSettings,
    };
  }
}