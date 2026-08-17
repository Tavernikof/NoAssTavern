import { FastifyInstance } from "fastify";
import { z } from "zod";
import { StorageService } from "../storage.service.js";
import { ChatAssistantMessageSchema } from "../storages/ChatAssistantMessages.js";

const chatParamsSchema = z.object({
  chatId: z.uuid(),
  assistantChatId: z.uuid(),
});

const messageParamsSchema = chatParamsSchema.extend({
  messageId: z.uuid(),
});

export const chatAssistantMessagesRoutes = (storage: StorageService) => async (app: FastifyInstance) => {
  const service = storage.chatAssistantMessages;

  app.get("/chats/:chatId/assistantChats/:assistantChatId/messages", {
    schema: { params: chatParamsSchema },
  }, async (req) => {
    const { chatId, assistantChatId } = req.params as z.infer<typeof chatParamsSchema>;
    return service.listForChat(chatId, assistantChatId);
  });

  app.get("/chats/:chatId/assistantChats/:assistantChatId/messages/:messageId", {
    schema: { params: messageParamsSchema },
  }, async (req, reply) => {
    const { chatId, assistantChatId, messageId } = req.params as z.infer<typeof messageParamsSchema>;
    const message = await service.getForChat(chatId, assistantChatId, messageId);
    if (!message) return reply.status(404).send({ error: "Not found" });
    return message;
  });

  app.post("/chats/:chatId/assistantChats/:assistantChatId/messages", {
    schema: { params: chatParamsSchema, body: ChatAssistantMessageSchema },
  }, async (req) => {
    const { chatId, assistantChatId } = req.params as z.infer<typeof chatParamsSchema>;
    const message = req.body as z.infer<typeof ChatAssistantMessageSchema>;
    return service.createForChat({ ...message, chatId, assistantChatId });
  });

  app.delete("/chats/:chatId/assistantChats/:assistantChatId/messages/:messageId", {
    schema: { params: messageParamsSchema },
  }, async (req) => {
    const { chatId, assistantChatId, messageId } = req.params as z.infer<typeof messageParamsSchema>;
    return { success: await service.deleteForChat(chatId, assistantChatId, messageId) };
  });
};
