import { action, makeObservable, observable } from "mobx";
import { promptStorage } from "src/storages/PromptsStorage.ts";
import { Prompt } from "src/store/Prompt.ts";

class PromptsManager {
  @observable prompts: string[] = [];
  @observable promptsDict: Record<string, Prompt> = {};
  @observable ready = false;

  constructor() {
    makeObservable(this);

    promptStorage.getItems().then(action(data => {

      const list: string[] = [];
      const dict: Record<string, Prompt> = {};
      data.forEach(item => {
        list.push(item.id);
        dict[item.id] = new Prompt(item);
      });
      this.prompts = list;
      this.promptsDict = dict;
      this.ready = true;
    }));
  }

  @action
  add(prompt: Prompt) {
    this.prompts.unshift(prompt.id);
    this.promptsDict[prompt.id] = prompt;
    prompt.save();
  }

  @action
  remove(prompt: Prompt) {
    this.prompts = this.prompts.filter(p => p !== prompt.id);
    delete this.promptsDict[prompt.id];
    promptStorage.removeItem(prompt.id);
  }
}

export const promptsManager = new PromptsManager();