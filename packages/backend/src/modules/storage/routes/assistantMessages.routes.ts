import { FastifyInstance } from "fastify";
import { StorageService } from "../storage.service.js";
import { registerCrudRoutes } from "../utils/registerCrudRoutes.js";
import { AssistantMessageSchema } from "../storages/AssistantMessages.js";

export const assistantMessagesRoutes = (storage: StorageService) => async (app: FastifyInstance) => {
  const service = storage.assistantMessages;

  app.register((app => {
    registerCrudRoutes(app, service, AssistantMessageSchema);
  }), { prefix: "/assistantMessages" });

  app.get("/assistantChats/:chatId/assistantMessages", async (req) => {
    const { chatId } = req.params as { chatId: string };
    return service.listForChat(chatId);
  });
};