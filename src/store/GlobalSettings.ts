import { action, autorun, makeObservable, observable } from "mobx";
import parseJSON from "src/helpers/parseJSON.ts";

class GlobalSettings {
  private stateKey = "noass-tavern-settings";

  @observable openaiKey = "";
  @observable geminiKey = "";
  @observable claudeKey = "";

  constructor() {
    this.loadState();

    makeObservable(this);

    autorun(() => this.saveState());
  }

  @action.bound
  updateOpenaiKey(key: string) {
    this.openaiKey = key;
  }

  @action.bound
  updateGeminiKey(key: string) {
    this.geminiKey = key;
  }

  @action.bound
  updateClaudeKey(key: string) {
    this.claudeKey = key;
  }


  loadState() {
    const state = parseJSON(localStorage[this.stateKey]) as GlobalStateStorage;
    if (!state) return;
    if (typeof state.openaiKey !== "undefined") this.openaiKey = state.openaiKey;
    if (typeof state.geminiKey !== "undefined") this.geminiKey = state.geminiKey;
    if (typeof state.claudeKey !== "undefined") this.claudeKey = state.claudeKey;
  }

  saveState() {
    const state: GlobalStateStorage = {
      openaiKey: this.openaiKey,
      geminiKey: this.geminiKey,
      claudeKey: this.claudeKey,
    };
    localStorage[this.stateKey] = JSON.stringify(state);
  }

}

export const globalSettings = new GlobalSettings();