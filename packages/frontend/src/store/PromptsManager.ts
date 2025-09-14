import { promptStorage, PromptStorageItem } from "src/storages/PromptsStorage.ts";
import { Prompt } from "src/store/Prompt.ts";
import { AbstractManager } from "src/helpers/AbstractManager.ts";
import { readJsonFromFile } from "src/helpers/readJsonFromFile.ts";
import { validatePresetImport } from "src/helpers/validatePresetImport.ts";
import arrayToIdIndex from "src/helpers/arrayToIdIndex.ts";
import { ChatMessageRole } from "src/enums/ChatManagerRole.ts";

class PromptsManager extends AbstractManager<Prompt, PromptStorageItem> {
  constructor() {
    super(promptStorage, Prompt);
  }

  getLabel(entity: Prompt): string {
    return entity.name;
  }

  import = (file: File) => {
    readJsonFromFile(file).then(
      (tavernPreset) => {
        // console.log(file);
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

            const preset = Prompt.createEmpty();
            preset.name = file.name.replace(".json", "");
            preset.blocks = [{
              role: ChatMessageRole.ASSISTANT,
              content: blockContent,
            }];
            preset.generationConfig = {
              stream: true,
              temperature: tavernPreset.temperature,
              stopSequences: [],
              maxOutputTokens: tavernPreset.openai_max_tokens,
              topP: tavernPreset.top_p,
              topK: tavernPreset.top_k,
              presencePenalty: tavernPreset.presence_penalty,
              frequencyPenalty: tavernPreset.frequency_penalty,
            };
            this.add(preset);
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
}

export const promptsManager = new PromptsManager();
window.promptsManager = promptsManager;