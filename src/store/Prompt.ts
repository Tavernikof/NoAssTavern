import { action, autorun, computed, makeObservable, observable, toJS } from "mobx";
import { promptStorage, PromptStorageItem } from "src/storages/PromptsStorage.ts";
import { BackendProvider } from "src/enums/BackendProvider.ts";
import { v4 as uuid } from "uuid";
import { ChatMessageRole } from "src/enums/ChatManagerRole.ts";
import { readJsonFromFile } from "src/helpers/readJsonFromFile.ts";
import { validatePresetImport } from "src/helpers/validatePresetImport.ts";
import arrayToIdIndex from "src/helpers/arrayToIdIndex.ts";
import { promptsManager } from "src/store/PromptsManager.ts";
import { prepareMessage } from "src/helpers/prepareMessage.ts";
import _cloneDeep from "lodash/cloneDeep";

export class Prompt {
  @observable id: string;
  @observable name: string;
  @observable createdAt: Date;
  @observable blocks: PromptBlock[];
  @observable backendProviderId: BackendProvider;
  @observable connectionProxyId: string | null;
  @observable.ref generationConfig: PromptGenerationConfig;

  @observable isNew: boolean;

  constructor(data: PromptStorageItem, config?: PromptCreateConfig) {
    this.isNew = config?.isNew ?? false;
    this.update(data);

    makeObservable(this);

    autorun(() => {
      if (this.isNew) return;
      const object = this.serialize();
      promptStorage.updateItem(object);
    });
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
      generationConfig: {
        model: "",
        stream: true,
      },
    }, { isNew: true });
  }

  static import = (file: File) => {
    readJsonFromFile(file).then(
      (tavernPreset) => {
        // console.log(file);
        console.log(tavernPreset);
        try {
          if (validatePresetImport(tavernPreset)) {
            const promptsDict = arrayToIdIndex(tavernPreset.prompts, "identifier");
            const order = tavernPreset.prompt_order[tavernPreset.prompt_order.length - 1].order;


            const blockContent: PresetBlockContent[] = [];

            const systemPromptsMapping: Record<string, string> = {
              scenario: "{{scenario}}",
              personaDescription: "{{persona}}",
              chatHistory: "{{history}}",
              charDescription: "{{description}}",
              charPersonality: "{{personality}}",
            };

            // console.log(order, promptsDict);
            order.forEach(({ identifier, enabled }) => {
              const prompt = promptsDict[identifier];
              if (!prompt) return;
              blockContent.push({
                active: enabled,
                name: prompt.name,
                content: systemPromptsMapping[identifier] ?? prompt.content ?? "",
              });
            });

            const preset = this.createEmpty();
            preset.name = file.name.replace(".json", "");
            preset.blocks = [{
              role: ChatMessageRole.ASSISTANT,
              content: blockContent,
            }];
            preset.generationConfig = {
              model: "",
              stream: true,
              temperature: tavernPreset.temperature,
              stopSequences: [],
              maxOutputTokens: tavernPreset.openai_max_tokens,
              topP: tavernPreset.top_p,
              topK: tavernPreset.top_k,
              presencePenalty: tavernPreset.presence_penalty,
              frequencyPenalty: tavernPreset.frequency_penalty,
            };
            console.log(blockContent);
            console.log(preset);
            promptsManager.add(preset);
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
  clone() {
    const promptStorageItem = _cloneDeep(this.serialize());
    promptStorageItem.id = uuid();
    promptStorageItem.createdAt = new Date();
    return new Prompt(promptStorageItem, { isNew: true });
  }

  buildMessages(vars: PresetVars) {
    return this.blocks.reduce<PresetPrompt>((messages, block) => {
      const content = block.content.reduce<string[]>((content, blockContent) => {
        if (blockContent.active) {
          content.push(prepareMessage(blockContent.content, vars));
        }
        return content;
      }, []).join("\n").trim();
      if (content.length) messages.push({ role: block.role, content });

      return messages;
    }, []);
  }

  private serialize(): PromptStorageItem {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
      blocks: toJS(this.blocks),
      backendProviderId: this.backendProviderId,
      connectionProxyId: this.connectionProxyId,
      generationConfig: this.generationConfig,
    };
  }
}