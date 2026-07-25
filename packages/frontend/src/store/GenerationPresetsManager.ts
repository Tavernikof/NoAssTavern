import { generationPresetsStorage, GenerationPresetStorageItem } from "src/storages/GenerationPresetsStorage.ts";
import { GenerationPreset } from "src/store/GenerationPreset.ts";
import { AbstractManager } from "src/helpers/AbstractManager.ts";

class GenerationPresetsManager extends AbstractManager<GenerationPreset, GenerationPresetStorageItem> {
  constructor() {
    super(generationPresetsStorage, GenerationPreset);
  }

  getLabel(entity: GenerationPreset): string {
    return entity.name;
  }
}

export const generationPresetsManager = new GenerationPresetsManager();
