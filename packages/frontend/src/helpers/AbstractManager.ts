import { BaseStorage } from "src/storages/baseStorage/BaseStorage.ts";
import { action, computed, makeObservable, observable, runInAction, when } from "mobx";
import { globalSettings } from "src/store/GlobalSettings.ts";

export interface Constructor<T> {
  new(...args: any[]): T;
}

export interface BaseEntity {
  id: string;
  name: string;

  save(): void | Promise<void>;
}

export abstract class AbstractManager<E extends BaseEntity, S extends { id: string, createdAt: Date }> {
  abstract getLabel(entity: E): string;

  @observable list: string[];
  @observable dict: Record<string, E>;
  @observable ready = false;

  protected constructor(
    readonly storage: BaseStorage<S>,
    readonly entityConstructor: Constructor<E>,
  ) {
    makeObservable(this);

    this.loadList();
  }

  private async loadList() {
    await when(() => globalSettings.ready);
    const data = await this.storage.getItems();

    const list: string[] = [];
    const dict: Record<string, E> = {};

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      list.push(item.id);
      dict[item.id] = new this.entityConstructor(await this.migrateEntity(item));
    }

    runInAction(() => {
      this.list = list;
      this.dict = dict;
      this.ready = true;
    });
  }

  protected async migrateEntity(baseItem: S) {
    return baseItem;
  }

  @computed
  get fullList() {
    return this.list.map(id => this.dict[id]);
  }

  @computed
  get selectOptions() {
    return this.list.map((entityId) => ({
      value: entityId,
      label: this.getLabel(this.dict[entityId]),
    }));
  }

  async add(entity: E) {
    await entity.save();
    runInAction(() => {
      this.dict[entity.id] = entity;
      this.list.unshift(entity.id);
    });
  }

  @action.bound
  remove(entity: E) {
    return this.storage.removeItem(entity.id).then(action(() => {
      this.list = this.list.filter(entityId => entityId !== entity.id);
      delete this.dict[entity.id];
    }));
  }
}