import { FastifyInstance } from "fastify";
import { registerCrudRoutes } from "../utils/registerCrudRoutes.js";
import { StorageService } from "../storage.service.js";
import { AssistantChatSchema } from "../storages/AssistantChats.js";

export const assistantChatsRoutes = (storage: StorageService) => async (app: FastifyInstance) => {
  registerCrudRoutes(app, storage.assistantChats, AssistantChatSchema);
};