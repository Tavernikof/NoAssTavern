import { FastifyInstance } from "fastify";
import { registerCrudRoutes } from "../utils/registerCrudRoutes.js";
import { CharacterSchema } from "../storages/Characters.js";
import { StorageService } from "../storage.service.js";

export const charactersRoutes = (storage: StorageService) => async (app: FastifyInstance) => {
  registerCrudRoutes(app, storage.characters, CharacterSchema);
};