import { FastifyInstance } from "fastify";
import { registerCrudRoutes } from "../utils/registerCrudRoutes.js";
import { LoreBookSchema } from "../storages/LoreBooks.js";
import { StorageService } from "../storage.service.js";

export const loreBooksRoutes = (storage: StorageService) => async (app: FastifyInstance) => {
  registerCrudRoutes(app, storage.loreBooks, LoreBookSchema);
};