import { action, computed, makeObservable, observable, reaction, runInAction, toJS } from "mobx";
import {
  FlowExtraBlock,
  FlowSchemeState,
  flowsStorage,
  FlowStorageItem,
} from "src/storages/FlowsStorage.ts";
import { v4 as uuid } from "uuid";
import { Prompt } from "src/store/Prompt.ts";
import { FlowNode } from "src/enums/FlowNode.ts";
import { MessageController } from "src/routes/SingleChat/helpers/MessageController.ts";
import randomString from "src/helpers/randomString.ts";
import { FlowRunner } from "src/store/FlowRunner.ts";
import _cloneDeep from "lodash/cloneDeep";
import { PromptStorageItem } from "src/storages/PromptsStorage.ts";

type FlowCreateConfig = {
  isNew?: boolean
  local?: boolean
}

export class Flow {
  @observable id: string;
  @observable createdAt: Date;
  @observable name: string;
  @observable userPrefix: string;
  @observable.ref schemes: Record<string, FlowSchemeState>;
  @observable extraBlocks: FlowExtraBlock[];
  @observable prompts: Prompt[] = [];

  @observable isNew: boolean;
  local: boolean;

  @observable currentProcess: FlowRunner[] = [];

  constructor(data: FlowStorageItem, config?: FlowCreateConfig) {
    this.isNew = config?.isNew ?? false;
    this.local = config?.local ?? false;

    this.update(data);

    makeObservable(this);

    if (!this.local) {
      reaction(() => [this.serialize(), this.isNew] as const, ([object, isNew]) => {
        if (isNew) return;
        flowsStorage.updateItem(object);
      });
    }
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
      prompts: [],
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
  get isProcess() {
    return Boolean(this.currentProcess?.length);
  }

  @action
  update(flowContent: Partial<FlowStorageItem>) {
    for (const field in flowContent) {
      const data = flowContent[field as keyof FlowStorageItem];

      if (data !== undefined) {
        if (field === "prompts") {
          this[field] = (data as PromptStorageItem[]).map(prompt => prompt instanceof Prompt
            ? prompt
            : new Prompt(prompt, { local: true }),
          );
        } else {
          // @ts-expect-error fuck ts
          this[field] = data;

        }
      }
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

  @action
  clone(local?: boolean) {
    const flowStorageItem = _cloneDeep(this.serialize());
    flowStorageItem.id = uuid();
    flowStorageItem.createdAt = new Date();
    return new Flow(flowStorageItem, { isNew: true, local });
  }

  registerFlowRunner(flowRunner: FlowRunner, process: Promise<void>) {
    this.currentProcess.push(flowRunner);
    process.finally(() => {
      const index = this.currentProcess.findIndex(runner => runner === flowRunner);
      if (index !== -1) runInAction(() => this.currentProcess.splice(index, 1));
    });
  }

  serialize(): FlowStorageItem {
    return {
      id: this.id,
      createdAt: this.createdAt,
      name: this.name,
      userPrefix: this.userPrefix,
      schemes: toJS(this.schemes),
      extraBlocks: toJS(this.extraBlocks),
      prompts: this.prompts.map(prompt => prompt.serialize()),
    };
  }
}