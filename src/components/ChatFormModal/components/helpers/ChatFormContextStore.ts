import { Chat } from "src/store/Chat.ts";
import { action, autorun, computed, makeObservable, observable } from "mobx";
import { flowsManager } from "src/store/FlowsManager.ts";
import { charactersManager } from "src/store/CharactersManager.ts";
import { DisposableContainer } from "src/helpers/DisposableContainer.ts";

export class ChatFormContextStore {
  dc = new DisposableContainer();

  @observable scenarios: { text: string, characterId: string | null }[] = [{ text: "", characterId: null }];
  @observable selectedScenario = 0;

  constructor(readonly chat?: Chat) {
    makeObservable(this);

    if (this.chat) {
      this.scenarios[0].text = this.chat.scenario || "";
    }

    this.dc.addReaction(autorun(() => {
      if (this.selectedScenario >= this.scenarios.length) {
        this.selectedScenario = this.scenarios.length - 1;
      }
    }));
  }

  dispose() {
    this.dc.dispose();
  }

  @computed
  get flowsOptions() {
    const flows = flowsManager.flows.map(flowId => ({
      value: flowId,
      label: flowsManager.flowsDict[flowId].name,
    }));
    if (this.chat) flows.unshift({
      value: this.chat.flow.id,
      label: `${this.chat.flow.name} (current)`,
    });
    return flows;
  }

  @computed
  get scenario() {
    return this.scenarios[this.selectedScenario].text;
  }

  set scenario(value: string) {
    this.scenarios[this.selectedScenario].text = value;
  }

  @action.bound
  addScenario(characterId: string) {
    if (this.scenarios.find(s => s.characterId === characterId)) return;

    const character = charactersManager.charactersDict[characterId];
    if (character?.scenario) this.scenarios.push({
      text: character.scenario,
      characterId: character.id,
    });
  }

  @action.bound
  removeScenario(characterId: string) {
    const index = this.scenarios.findIndex(s => s.characterId === characterId);
    if (index !== -1) this.scenarios.splice(index, 1);
  }

  @action.bound
  setSelectedScenario(selectedScenario: number) {
    this.selectedScenario = selectedScenario;
  }
}