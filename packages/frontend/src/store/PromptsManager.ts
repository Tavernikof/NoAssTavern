import { promptStorage, PromptStorageItem } from "src/storages/PromptsStorage.ts";
import { Prompt } from "src/store/Prompt.ts";
import { AbstractManager } from "src/helpers/AbstractManager.ts";
import { readJsonFromFile } from "src/helpers/readJsonFromFile.ts";
import { validatePresetImport } from "src/helpers/validatePresetImport.ts";
import arrayToIdIndex from "src/helpers/arrayToIdIndex.ts";
import { action } from "mobx";
import { ChatMessageRole } from "src/enums/ChatManagerRole.ts";

class PromptsManager extends AbstractManager<Prompt, PromptStorageItem> {
  constructor() {
    super(promptStorage, Prompt);
  }

  getLabel(entity: Prompt): string {
    return entity.name;
  }

  import = (file: File) => {
    // It's important to keep this outside of import
    const prompt = Prompt.createEmpty();

    readJsonFromFile(file).then(
      action((tavernPreset) => {
        try {
          if (validatePresetImport(tavernPreset)) {
            const promptsDict = arrayToIdIndex(tavernPreset.prompts, "identifier");
            const order = tavernPreset.prompt_order[tavernPreset.prompt_order.length - 1].order;

            const systemPromptsMapping: Record<string, string> = {
              scenario: "{{scenario}}",
              personaDescription: "{{persona}}",
              chatHistory: "{{history}}",
              charDescription: "{{description}}",
            };

            const blocks: PromptBlock[] = [];
            let currentBlock: PromptBlock | undefined;

            order.forEach(({ identifier, enabled }) => {
              const prompt = promptsDict[identifier];
              if (!prompt) return;
              // Skip empty blocks
              if (!prompt.name && !enabled) return;

              if (prompt.role && currentBlock?.role !== prompt.role) {
                if (currentBlock) blocks.push(currentBlock);
                currentBlock = { role: prompt.role as ChatMessageRole, content: [] };
              }

              currentBlock?.content.push({
                active: enabled,
                name: prompt.name,
                content: systemPromptsMapping[identifier] ?? prompt.content ?? "",
              });
            });

            if (currentBlock && currentBlock.content.length > 0) {
              blocks.push(currentBlock);
            }

            prompt.name = file.name.replace(".json", "");
            prompt.blocks = blocks;
            prompt.generationConfig = {
              stream: true,
              temperature: tavernPreset.temperature,
              stopSequences: [],
              maxOutputTokens: tavernPreset.openai_max_tokens,
              topP: tavernPreset.top_p,
              topK: tavernPreset.top_k,
              presencePenalty: tavernPreset.presence_penalty,
              frequencyPenalty: tavernPreset.frequency_penalty,
            };
            this.add(prompt);
          }
        } catch (e) {
          if (e instanceof Error) alert(e.message);
        }
      }),
      () => {
        alert("Wrong file");
      },
    );
  };

  async importDefault() {
    await import("src/seeds/prompts").then(({ default: prompts }) => {
      prompts.forEach((prompt) => this.add(new Prompt(prompt, { isNew: true })));
    });
  }
}

export const promptsManager = new PromptsManager();
window.promptsManager = promptsManager;