import { action, makeObservable, observable, reaction } from "mobx";
import { generationPresetsStorage, GenerationPresetStorageItem } from "src/storages/GenerationPresetsStorage.ts";
import { BackendProvider } from "src/enums/BackendProvider.ts";
import { v4 as uuid } from "uuid";

type GenerationPresetCreateConfig = {
  isNew?: boolean,
};

export class GenerationPreset {
  id: string;
  createdAt: Date;
  @observable name: string;
  @observable backendProviderId: BackendProvider;
  @observable connectionProxyId: string | null;
  @observable model: string;
  @observable.ref generationConfig: PromptGenerationConfig;

  @observable isNew: boolean;

  constructor(data: GenerationPresetStorageItem, config?: GenerationPresetCreateConfig) {
    this.update(data);

    this.isNew = config?.isNew ?? false;

    makeObservable(this);

    reaction(() => [this.serialize(), this.isNew] as const, ([object, isNew]) => {
      if (isNew) return;
      generationPresetsStorage.updateItem(object);
    });
  }

  static createEmpty() {
    return new this({
      id: uuid(),
      createdAt: new Date(),
      name: "",
      backendProviderId: BackendProvider.OPENAI,
      connectionProxyId: null,
      model: "",
      generationConfig: {},
    }, { isNew: true });
  }

  @action
  save() {
    this.isNew = false;
  }

  @action
  update(data: Partial<GenerationPresetStorageItem>) {
    for (const field in data) {
      const value = data[field as keyof GenerationPresetStorageItem];
      // @ts-expect-error fuck ts
      if (value !== undefined) this[field] = value;
    }
  }

  serialize(): GenerationPresetStorageItem {
    return {
      id: this.id,
      createdAt: this.createdAt,
      name: this.name,
      backendProviderId: this.backendProviderId,
      connectionProxyId: this.connectionProxyId,
      model: this.model,
      generationConfig: this.generationConfig,
    };
  }
}
