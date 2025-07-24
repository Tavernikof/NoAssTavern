import { Flow } from "src/store/Flow.ts";
import { Prompt } from "src/store/Prompt.ts";
import { promptsManager } from "src/store/PromptsManager.ts";
import { action, autorun, computed, makeObservable, observable, runInAction } from "mobx";
import { FlowExtraBlock, FlowSchemeState } from "src/storages/FlowsStorage.ts";
import _cloneDeep from "lodash/cloneDeep";
import { defaultSchemesDict } from "src/enums/SchemeName.ts";
import { DisposableContainer } from "src/helpers/DisposableContainer.ts";

export class FlowEditorState {
  private dc = new DisposableContainer();
  @observable.shallow schemeStates: Record<string, FlowSchemeState> = {};
  @observable extraBlocks: FlowExtraBlock[];
  @observable promptsDict: Record<string, { prompt: Prompt, new: boolean, used: boolean }> = {};
  flow: Flow;

  constructor(flow: Flow) {
    this.flow = flow;
    this.extraBlocks = _cloneDeep(flow.extraBlocks);
    for (const schemeName in flow.schemes) {
      this.schemeStates[schemeName] = flow.schemes[schemeName];
    }

    flow.prompts.forEach(prompt => {
      this.promptsDict[prompt.id] = { prompt, new: false, used: true };
    });

    makeObservable(this);

    this.dc.addReaction(autorun(() => {
      const usedPrompts = new Set<string>();

      for (const schemeName in this.schemeStates) {
        const state = this.schemeStates[schemeName];
        state.nodes.forEach(node => {
          const promptOption = node.data.prompt;
          if (promptOption) {
            const promptId = promptOption.value;
            usedPrompts.add(promptId);
            if (!this.promptsDict[promptId]) runInAction(() => {
              this.promptsDict[promptId] = {
                prompt: promptsManager.promptsDict[promptId].clone(true),
                new: true,
                used: true,
              };
            });
          }
        });
      }

      runInAction(() => {
        for (const id in this.promptsDict) {
          this.promptsDict[id].used = usedPrompts.has(id);
        }
      });
    }));
  }

  dispose() {
    this.dc.dispose();
  }

  @computed
  get prompts(): { prompt: Prompt, new: boolean, used: boolean }[] {
    return Object.values(this.promptsDict);
  }

  @computed
  get promptsOptions() {
    return [
      ...this.flow.prompts.map(prompt => ({ value: prompt.id, label: `${prompt.name} (current)` })),
      ...promptsManager.prompts.map(promptId => {
        const prompt = promptsManager.promptsDict[promptId];
        return { value: prompt.id, label: prompt.name };
      }),
    ];
  }

  @computed
  get extraBlocksOptions() {
    return [
      ...defaultSchemesDict.list.map(defaultScheme => ({
        value: defaultScheme.id,
        label: defaultScheme.label,
      })),
      ...this.extraBlocks.map(extraBlock => ({
        value: extraBlock.id,
        label: extraBlock.key,
      })),
    ];
  }

  @action
  setSchemeState(schemeName: string, state: FlowSchemeState) {
    this.schemeStates[schemeName] = state;
  }

  @action.bound
  addExtraBlock() {
    const extraBlock = Flow.createEmptyExtraBlock();
    this.schemeStates[extraBlock.id] = Flow.createEmptySchemeState();
    this.extraBlocks.push(extraBlock);
  }

  @action
  updateExtraBlockName(blockId: string, key: string) {
    const extraBlock = this.extraBlocks.find(block => block.id === blockId);
    if (extraBlock) extraBlock.key = key;
  }

  @action
  removeExtraBlock(blockId: string) {
    this.extraBlocks = this.extraBlocks.filter(block => block.id !== blockId);
    delete this.schemeStates[blockId];
  }

  @action
  removePrompt(promptId: string) {
    for (const id in this.promptsDict) {
      if (this.promptsDict[id].prompt.id === promptId) {
        delete this.promptsDict[id];
        return;
      }
    }
  }

  serializeState() {
    const schemes: Record<string, FlowSchemeState> = {};

    for (const schemeName in this.schemeStates) {
      const state = this.schemeStates[schemeName];

      schemes[schemeName] = {
        nodes: state.nodes.map(node => {
          const data = _cloneDeep(node.data);
          if (data.prompt) {
            const prompt = this.promptsDict[data.prompt.value];
            data.prompt = { value: prompt.prompt.id, label: `${prompt.prompt.name} (current)` };
          }
          return {
            id: node.id,
            type: node.type,
            position: node.position,
            data,
          };
        }),
        edges: state.edges,
      };
    }

    return {
      schemes,
      prompts: this.prompts.map(p => p.prompt),
      extraBlocks: this.extraBlocks,
    };
  }
}