import { FastifyInstance } from "fastify";
import { registerCrudRoutes } from "../utils/registerCrudRoutes.js";
import { StorageService } from "../storage.service.js";
import { CodeBlockSchema } from "../storages/CodeBlocks.js";

export const codeBlockRoutes = (storage: StorageService) => async (app: FastifyInstance) => {
  registerCrudRoutes(app, storage.codeBlocks, CodeBlockSchema);
};