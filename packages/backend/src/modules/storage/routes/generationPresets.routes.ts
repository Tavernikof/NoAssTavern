import { FastifyInstance } from "fastify";
import { registerCrudRoutes } from "../utils/registerCrudRoutes.js";
import { GenerationPresetSchema } from "../storages/GenerationPresets.js";
import { StorageService } from "../storage.service.js";

export const generationPresetsRoutes = (storage: StorageService) => async (app: FastifyInstance) => {
  registerCrudRoutes(app, storage.generationPresets, GenerationPresetSchema);
};
