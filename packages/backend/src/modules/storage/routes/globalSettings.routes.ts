import { FastifyInstance } from "fastify";
import { registerCrudRoutes } from "../utils/registerCrudRoutes.js";
import { CharacterSchema } from "../storages/Characters.js";
import { StorageService } from "../storage.service.js";
import { GlobalSettings, GlobalSettingsSchema } from "../storages/GlobalSettings.js";

export const globalSettingsRoutes = (storage: StorageService) => async (app: FastifyInstance) => {
  app.get("/", async () => {
    return storage.globalSettings.get();
  });

  app.post("/", { schema: { body: GlobalSettingsSchema } }, async (req) => {
    return storage.globalSettings.save(req.body as GlobalSettings);
  });
};