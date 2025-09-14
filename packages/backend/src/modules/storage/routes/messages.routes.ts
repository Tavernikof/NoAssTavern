import { FastifyInstance } from "fastify";
import { MessageSchema } from "../storages/Messages.js";
import { StorageService } from "../storage.service.js";
import { registerCrudRoutes } from "../utils/registerCrudRoutes.js";
import { LoreBookSchema } from "../storages/LoreBooks.js";

export const messagesRoutes = (storage: StorageService) => async (app: FastifyInstance) => {
  const service = storage.messages;

  app.register((app => {
    registerCrudRoutes(app, service, MessageSchema);
  }), { prefix: "/messages" });

  app.get("/chats/:chatId/messages", async (req) => {
    const { chatId } = req.params as { chatId: string };
    return service.listForChat(chatId);
  });
};