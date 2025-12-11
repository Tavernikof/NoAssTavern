import { FastifyInstance } from "fastify";
import { charactersRoutes } from "./routes/characters.routes.js";
import { chatsRoutes } from "./routes/chats.routes.js";
import { connectionProxiesRoutes } from "./routes/connectionProxies.routes.js";
import { flowsRoutes } from "./routes/flows.routes.js";
import { loreBooksRoutes } from "./routes/loreBooks.routes.js";
import { messagesRoutes } from "./routes/messages.routes.js";
import { promptsRoutes } from "./routes/prompts.routes.js";
import { requestsRoutes } from "./routes/requests.routes.js";
import { StorageService } from "./storage.service.js";
import { migrateRoutes } from "./routes/migrate.routes.js";
import { imagesRoutes } from "./routes/images.routes.js";
import { globalSettingsRoutes } from "./routes/globalSettings.routes.js";
import { assistantChatsRoutes } from "./routes/assistantChats.routes.js";
import { assistantMessagesRoutes } from "./routes/assistantMessages.routes.js";

export async function storageRoutes(app: FastifyInstance) {
  const service = new StorageService();

  app.register(assistantChatsRoutes(service), { prefix: "/assistantChats" });
  app.register(assistantMessagesRoutes(service), { prefix: "" });
  app.register(charactersRoutes(service), { prefix: "/characters" });
  app.register(chatsRoutes(service), { prefix: "/chats" });
  app.register(connectionProxiesRoutes(service), { prefix: "/connectionProxies" });
  app.register(flowsRoutes(service), { prefix: "/flows" });
  app.register(globalSettingsRoutes(service), { prefix: "/globalSettings" });
  app.register(imagesRoutes(service), { prefix: "/images" });
  app.register(loreBooksRoutes(service), { prefix: "/loreBooks" });
  app.register(messagesRoutes(service), { prefix: "" });
  app.register(promptsRoutes(service), { prefix: "/prompts" });
  app.register(requestsRoutes(service), { prefix: "/requests" });
  app.register(migrateRoutes(service), { prefix: "/migrate" });
}
