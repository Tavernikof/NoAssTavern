import { action, makeObservable, observable } from "mobx";
import { personasStorage } from "src/storages/PersonasStorage.ts";
import { Persona } from "src/store/Persona.ts";
import { validatePersonasImport } from "src/helpers/validatePersonasImport.ts";
import { v4 as uuid } from "uuid";
import { readJsonFromFile } from "src/helpers/readJsonFromFile.ts";

export class PersonasManager {
  @observable personas: string[] = [];
  @observable personasDict: Record<string, Persona> = {};

  constructor() {
    makeObservable(this);

    personasStorage.getItems().then(action((data) => {
      const list: string[] = [];
      const dict: Record<string, Persona> = {};
      data.forEach(card => {
        list.push(card.id);
        dict[card.id] = new Persona(card);
      });
      this.personas = list;
      this.personasDict = dict;
    }));
  }

  @action
  add(persona: Persona) {
    this.personas.unshift(persona.id);
    this.personasDict[persona.id] = persona;
    persona.save();
  }

  @action
  remove(persona: Persona) {
    this.personas = this.personas.filter(personaId => personaId !== persona.id);
    delete this.personasDict[persona.id];
    personasStorage.removeItem(persona.id);
  }

  importList = (file: File) => {
    readJsonFromFile(file).then(
      (importResult) => {
        try {
          if (validatePersonasImport(importResult)) {
            for (const key in importResult.persona_descriptions) {
              const { description } = importResult.persona_descriptions[key];
              const name = importResult.personas[key];
              const persona = new Persona({
                id: uuid(),
                createdAt: new Date(+key.split("-")[0]),
                name,
                description,
              });
              this.personas.unshift(persona.id);
              this.personasDict[persona.id] = persona;
            }
          }
        } catch (e) {
          if (e instanceof Error) alert(e.message);
        }
      },
      () => {
        alert("Wrong file");
      },
    );
  };
}

export const personasManager = new PersonasManager();