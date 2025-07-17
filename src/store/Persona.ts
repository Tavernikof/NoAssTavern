import { action, autorun, makeObservable, observable } from "mobx";
import { personasStorage, PersonaStorageItem } from "src/storages/PersonasStorage.ts";
import { v4 as uuid } from "uuid";
import _cloneDeep from "lodash/cloneDeep";

export class Persona {
  @observable id: string;
  @observable createdAt: Date;
  @observable name: string;
  @observable description: string;

  @observable isNew: boolean;

  constructor(persona: PersonaStorageItem, config?: PersonaCreateConfig) {
    this.isNew = config?.isNew ?? false;

    this.update(persona);

    makeObservable(this);

    autorun(() => {
      if (this.isNew) return;
      const object = this.serialize();
      personasStorage.updateItem(object);
    });
  }

  static createEmpty(): Persona {
    return new this({
      id: uuid(),
      createdAt: new Date(),
      name: "",
      description: "",
    }, { isNew: true });
  }

  @action
  update(personaContent: Partial<PersonaStorageItem>) {
    for (const field in personaContent) {
      const data = personaContent[field as keyof PersonaStorageItem];
      // @ts-expect-error fuck ts
      if (data !== undefined) this[field] = data;
    }
  }

  @action
  save() {
    this.isNew = false;
  }

  @action
  clone() {
    const personaStorageItem = _cloneDeep(this.serialize());
    personaStorageItem.id = uuid();
    personaStorageItem.createdAt = new Date();
    return new Persona(personaStorageItem, { isNew: true });
  }

  private serialize(): PersonaStorageItem {
    return {
      id: this.id,
      createdAt: this.createdAt,
      name: this.name,
      description: this.description,
    };
  }
}