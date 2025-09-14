import { action, IObservableArray, makeObservable, observable, reaction } from "mobx";
import { connectionProxiesStorage, ConnectionProxyStorageItem } from "src/storages/ConnectionProxiesStorage.ts";
import { v4 as uuid } from "uuid";

export class ConnectionProxy {
  id: string;
  createdAt: Date;
  @observable name: string;
  @observable baseUrl: string;
  @observable key: string;
  @observable modelsEndpoint: string;
  @observable.ref models: IObservableArray<string> | null;

  @observable isNew: boolean;

  constructor(data: ConnectionProxyStorageItem, config?: ConnectionProxyCreateConfig) {
    this.update(data);

    this.isNew = config?.isNew ?? false;

    makeObservable(this);

    reaction(() => [this.serialize(), this.isNew] as const, ([object, isNew]) => {
      if (isNew) return;
      connectionProxiesStorage.updateItem(object);
    });
  }

  static createEmpty() {
    return new this({
      id: uuid(),
      createdAt: new Date(),
      name: "",
      baseUrl: "",
      key: "",
      modelsEndpoint: "",
      models: null,
    }, { isNew: true });
  }

  @action
  save() {
    this.isNew = false;
  }

  @action
  update(data: Partial<ConnectionProxyStorageItem>) {
    for (const field in data) {
      const value = data[field as keyof ConnectionProxyStorageItem];
      // @ts-expect-error fuck ts
      if (value !== undefined) this[field] = value;
    }
  }

  serialize(): ConnectionProxyStorageItem {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
      baseUrl: this.baseUrl,
      key: this.key,
      modelsEndpoint: this.modelsEndpoint,
      models: this.models,
    };
  }

}
