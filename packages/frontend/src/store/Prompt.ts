import { action, computed, makeObservable, observable, reaction, toJS } from "mobx";
import { promptStorage, PromptStorageItem } from "src/storages/PromptsStorage.ts";
import { BackendProvider } from "src/enums/BackendProvider.ts";
import { v4 as uuid } from "uuid";
import { ChatMessageRole } from "src/enums/ChatManagerRole.ts";
import { prepareImpersonate, prepareMessage } from "src/helpers/prepareMessage.ts";
import _cloneDeep from "lodash/cloneDeep";

type PromptCreateConfig = {
  isNew?: boolean,
  local?: boolean
}

export class Prompt {
  @observable id: string;
  @observable name: string;
  @observable createdAt: Date;
  @observable blocks: PromptBlock[];
  @observable backendProviderId: BackendProvider;
  @observable connectionProxyId: string | null;
  @observable model: string;

  @observable.ref generationConfig: PromptGenerationConfig;

  @observable isNew: boolean;
  local: boolean;

  constructor(data: PromptStorageItem, config?: PromptCreateConfig) {
    this.isNew = config?.isNew ?? false;
    this.local = config?.local ?? false;

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
    }, { isNew: true });
  }

  @computed
  get levers() {
    return this.blocks.reduce<[number, number][]>((levers, block, blockIndex) => {
      block.content.forEach((item, itemIndex) => {
        if (item.name !== null) levers.push([blockIndex, itemIndex]);
      });
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
      // @ts-expect-error fuck ts
      if (data !== undefined) this[field] = data;
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

  buildMessages(vars: PresetVars) {
    return this.blocks.reduce<PresetPrompt>((messages, block) => {
      const content = block.content.reduce<string[]>((content, blockContent) => {
        if (blockContent.active) {
          content.push(prepareMessage(blockContent.content, vars));
        }
        return content;
      }, []).join("\n");
      if (content.length) messages.push({ role: block.role, content });

      return messages;
    }, []);
  }

  buildStopSequence(vars: PresetVars) {
    const { stopSequences } = this.generationConfig;
    const stop = (stopSequences as string[] ?? []).map(str => prepareMessage(prepareImpersonate(str), vars));
    return stop.length ? stop : undefined;
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
    };
  }
}