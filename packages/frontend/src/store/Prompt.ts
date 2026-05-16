import { action, computed, makeObservable, observable, reaction, toJS } from "mobx";
import { promptStorage, PromptStorageItem } from "src/storages/PromptsStorage.ts";
import { BackendProvider } from "src/enums/BackendProvider.ts";
import { v4 as uuid } from "uuid";
import { ChatMessageRole } from "src/enums/ChatManagerRole.ts";
import { prepareImpersonate, prepareMessage } from "src/helpers/prepareMessage.ts";
import _cloneDeep from "lodash/cloneDeep";
import { CodeBlockFunction, CodeBlockFunctionArg } from "src/enums/CodeBlockFunction.ts";
import { ChatSwipePrompt } from "src/enums/ChatSwipePrompt.ts";
import { codeBlocksManager } from "src/store/CodeBlocksManager.ts";
import { Flow } from "src/store/Flow.ts";

type PromptCreateConfig = {
  isNew?: boolean,
  local?: boolean,
  parentFlow?: Flow,
}

export class Prompt {
  @observable id: string;
  @observable name: string;
  @observable createdAt: Date;
  @observable blocks: (PromptMessageBlock | PromptHistoryBlock)[];
  @observable backendProviderId: BackendProvider;
  @observable connectionProxyId: string | null;
  @observable model: string;
  @observable codeBlocks: PromptCodeBlock[];

  @observable.ref generationConfig: PromptGenerationConfig;

  @observable isNew: boolean;
  local: boolean;
  parentFlow: Flow | null = null;

  constructor(data: PromptStorageItem, config?: PromptCreateConfig) {
    this.isNew = config?.isNew ?? false;
    this.local = config?.local ?? false;
    this.parentFlow = config?.parentFlow ?? null;

    this.update(data);

    makeObservable(this);

    if (!this.local) {
      reaction(() => [this.serialize(), this.isNew] as const, ([object, isNew]) => {
        if (isNew) return;
        promptStorage.updateItem(object);
      });
    }
  }

  static createEmpty(): Prompt {
    return new this({
      id: uuid(),
      name: "",
      createdAt: new Date(),
      blocks: [{
        role: ChatMessageRole.ASSISTANT,
        content: [{
          active: true,
          name: null,
          content: "",
        }],
      }],
      backendProviderId: BackendProvider.GEMINI,
      connectionProxyId: null,
      model: "",
      generationConfig: {
        stream: true,
      },
      codeBlocks: [],
    }, { isNew: true });
  }

  @computed
  get levers() {
    return this.blocks.reduce<[number, number][]>((levers, block, blockIndex) => {
      if (block.type !== "history") {
        block.content.forEach((item, itemIndex) => {
          if (item.name !== null) levers.push([blockIndex, itemIndex]);
        });
      }
      return levers;
    }, []);
  }

  @action.bound
  toggleBlockContent(block: PresetBlockContent) {
    block.active = !block.active;
  }

  @action
  update(promptContent: Partial<PromptStorageItem>) {
    for (const field in promptContent) {
      const data = promptContent[field as keyof PromptStorageItem];
      if (data !== undefined) {
        if (field === "codeBlocks") {
          this.codeBlocks = codeBlocksManager.syncPromptCodeBlocks(this.codeBlocks, data as PromptCodeBlock[]);
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
  clone(local?: boolean) {
    const promptStorageItem = _cloneDeep(this.serialize());
    promptStorageItem.id = uuid();
    promptStorageItem.createdAt = new Date();
    return new Prompt(promptStorageItem, { isNew: true, local });
  }

  async buildMessages(vars: PresetVarsGetter) {
    const messages: PresetPrompt = [];
    for (const block of this.blocks) {
      if (block.type === "history") {
        const history = await vars.getHistory({
          from: block.from,
          to: block.to,
        });
        history.forEach(message => {
          messages.push({
            role: message.role,
            content: (message.prompts[ChatSwipePrompt.message]?.message || "").trim(),
          });
        });
      } else {
        const contentParts: string[] = [];
        for (const blockContent of block.content) {
          if (blockContent.active) {
            contentParts.push(await prepareMessage(blockContent.content, vars));
          }
        }
        const content = contentParts.join("\n");
        if (content.length) messages.push({ role: block.role, content });
      }
    }

    return messages;
  }

  async buildStopSequence(vars: PresetVarsGetter) {
    const { stopSequences } = this.generationConfig;
    const stop = await Promise.all(
      (stopSequences as string[] ?? []).map(str => prepareMessage(prepareImpersonate(str), vars)),
    );
    return stop.length ? stop : undefined;
  }

  async callCodeBlockFunction<T extends CodeBlockFunction>(functionName: T, arg: CodeBlockFunctionArg<T>) {
    arg = await codeBlocksManager.callCodeBlockFunction(this.codeBlocks, functionName, arg);
    if (this.parentFlow) arg = await codeBlocksManager.callCodeBlockFunction(this.parentFlow.codeBlocks, functionName, arg);
    return arg;
  }

  serialize(): PromptStorageItem {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
      blocks: toJS(this.blocks),
      backendProviderId: this.backendProviderId,
      connectionProxyId: this.connectionProxyId,
      model: this.model,
      generationConfig: this.generationConfig,
      codeBlocks: this.codeBlocks?.map(item => ({ ...item, codeBlock: item.codeBlock.serialize() })) || [],
    };
  }
}