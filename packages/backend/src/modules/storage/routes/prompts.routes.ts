import { FastifyInstance } from "fastify";
import { registerCrudRoutes } from "../utils/registerCrudRoutes.js";
import { PromptSchema } from "../storages/Prompts.js";
import { StorageService } from "../storage.service.js";

export const promptsRoutes = (storage: StorageService) => async (app: FastifyInstance) => {
  registerCrudRoutes(app, storage.prompts, PromptSchema);
};