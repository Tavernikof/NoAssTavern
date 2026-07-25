import { z } from "zod";
import { AbstractStorage } from "../utils/AbstractStorage.js";
import { StorageService } from "../storage.service.js";

export const GenerationPresetSchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  name: z.string(),
  backendProviderId: z.string(),
  connectionProxyId: z.string().nullish(),
  model: z.string(),
  generationConfig: z.looseObject({}),
});

export type GenerationPreset = z.infer<typeof GenerationPresetSchema>;

export class GenerationPresetsStorage extends AbstractStorage<GenerationPreset> {
  constructor(readonly storageService: StorageService) {
    super("generationPresets", GenerationPresetSchema);
  }
}
