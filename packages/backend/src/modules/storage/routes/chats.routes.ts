import { FastifyInstance } from "fastify";
import { ChatSchema } from "../storages/Chats.js";
import { registerCrudRoutes } from "../utils/registerCrudRoutes.js";
import { StorageService } from "../storage.service.js";

export const chatsRoutes = (storage: StorageService) => async (app: FastifyInstance) => {
  registerCrudRoutes(app, storage.chats, ChatSchema);
};