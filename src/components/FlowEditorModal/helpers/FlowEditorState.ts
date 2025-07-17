import { Flow } from "src/store/Flow.ts";
import { Prompt } from "src/store/Prompt.ts";
import { promptsManager } from "src/store/PromptsManager.ts";
import { action, computed, makeObservable, observable } from "mobx";
import { FlowExtraBlock, FlowSchemeState } from "src/storages/FlowsStorage.ts";
import _cloneDeep from "lodash/cloneDeep";
import { defaultSchemesDict } from "src/enums/SchemeName.ts";

export class FlowEditorState {
  @observable.shallow schemeStates: Record<string, FlowSchemeState> = {};
  @observable extraBlocks: FlowExtraBlock[];
  flow: Flow;

  constructor(flow: Flow) {
    this.flow = flow;
    this.extraBlocks = _cloneDeep(flow.extraBlocks);
    for (const schemeName in flow.schemes) {
      this.schemeStates[schemeName] = flow.schemes[schemeName];
    }

    makeObservable(this);
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
    ]
  }

  @action
  setSchemeState(schemeName: string, state: FlowSchemeState) {
    this.schemeStates[schemeName] = state;
  }

  @action.bound
  addExtraBlock() {
    this.extraBlocks.push(Flow.createEmptyExtraBlock());
  }

  @action
  updateExtraBlockName(blockId: string, key: string) {
    const extraBlock = this.extraBlocks.find(block => block.id === blockId);
    if (extraBlock) extraBlock.key = key;
  }

  @action
  removeExtraBlock(blockId: string) {
    this.extraBlocks = this.extraBlocks.filter(block => block.id !== blockId);
  }

  @computed get usedPrompts() {
    const prompts = new Set<Prompt>();
    for (const schemeName in this.schemeStates) {
      const state = this.schemeStates[schemeName];
      state.nodes.forEach(node => {
        const promptPort = node.data.prompt?.value;
        if (promptPort) {
          const prompt = promptsManager.promptsDict[promptPort];
          if (prompt) prompts.add(prompt);
        }
      });
    }
    return [...prompts];
  }

  serializeState() {
    const schemes: Record<string, FlowSchemeState> = {};
    for (const schemeName in this.schemeStates) {
      const state = this.schemeStates[schemeName];
      schemes[schemeName] = {
        nodes: state.nodes.map(node => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: node.data,
        })),
        edges: state.edges,
      };
    }
    return schemes;
  }
}