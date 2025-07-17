import { action, autorun, computed, makeObservable, observable, runInAction, toJS } from "mobx";
import {
  FlowExtraBlock,
  FlowSchemeState,
  flowsStorage,
  FlowStorageItem,
} from "src/storages/FlowsStorage.ts";
import { v4 as uuid } from "uuid";
import { Prompt } from "src/store/Prompt.ts";
import { promptsManager } from "src/store/PromptsManager.ts";
import { FlowNode } from "src/enums/FlowNode";
import { MessageController } from "src/routes/SingleChat/helpers/MessageController.ts";
import randomString from "src/helpers/randomString.ts";
import { FlowRunner } from "src/store/FlowRunner.ts";

type FlowCreateConfig = {
  isNew?: boolean
}

export class Flow {
  @observable id: string;
  @observable createdAt: Date;
  @observable name: string;
  @observable userPrefix: string;
  @observable.ref schemes: Record<string, FlowSchemeState>;
  @observable extraBlocks: FlowExtraBlock[];

  @observable isNew: boolean;

  @observable currentProcess: FlowRunner[] = [];

  constructor(data: FlowStorageItem, config?: FlowCreateConfig) {
    this.isNew = config?.isNew ?? false;
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.name = data.name;
    this.userPrefix = data.userPrefix;
    this.schemes = data.schemes;
    this.extraBlocks = data.extraBlocks ?? [];

    makeObservable(this);

    autorun(() => {
      if (this.isNew) return;
      const object = this.serialize();
      flowsStorage.updateItem(object);
    });
  }

  static createEmptySchemeState(): FlowSchemeState {
    const id = randomString(10);
    return {
      nodes: [{
        id: id,
        type: FlowNode.start,
        position: { x: 0, y: 0 },
        data: {},
      }],
      edges: [],
    };
  }

  static createEmpty(): Flow {
    return new this({
      id: uuid(),
      createdAt: new Date(),
      name: "",
      userPrefix: "",
      schemes: {},
      extraBlocks: [],
    }, { isNew: true });
  }

  @action.bound
  static createEmptyExtraBlock(): FlowExtraBlock {
    return {
      id: uuid(),
      key: "",
    };
  }


  @computed
  get prompts() {
    const prompts = new Set<Prompt>();
    for (const schemeKey in this.schemes) {
      const scheme = this.schemes[schemeKey];
      scheme.nodes.forEach(node => {
        if (node.type === FlowNode.generate) {
          const promptId = node.data.prompt?.value;
          const prompt = promptsManager.promptsDict[promptId];
          if (prompt) prompts.add(prompt);
        }
      });
    }
    return [...prompts];
  }

  @computed
  get isProcess() {
    return Boolean(this.currentProcess?.length);
  }

  @action
  update(flowContent: Partial<FlowStorageItem>) {
    for (const field in flowContent) {
      const data = flowContent[field as keyof FlowStorageItem];
      // @ts-expect-error fuck ts
      if (data !== undefined) this[field] = data;
    }
  }

  @action
  save() {
    this.isNew = false;
  }

  @action
  stop() {
    this.currentProcess.forEach(flowRunner => flowRunner.stop());
    this.currentProcess = [];
  }

  @action
  process(schemeName: string, messageController: MessageController): Promise<void> {
    const flowRunner = new FlowRunner(this, schemeName, messageController);
    return flowRunner.process();
  }

  registerFlowRunner(flowRunner: FlowRunner, process: Promise<void>) {
    this.currentProcess.push(flowRunner);
    process.finally(() => {
      const index = this.currentProcess.findIndex(runner => runner === flowRunner);
      if (index !== -1) runInAction(() => this.currentProcess.splice(index, 1));
    });
  }

  private serialize(): FlowStorageItem {
    return {
      id: this.id,
      createdAt: this.createdAt,
      name: this.name,
      userPrefix: this.userPrefix,
      schemes: toJS(this.schemes),
      extraBlocks: toJS(this.extraBlocks),
    };
  }
}