import { FastifyInstance } from "fastify";
import { registerCrudRoutes } from "../utils/registerCrudRoutes.js";
import { ConnectionProxySchema } from "../storages/ConnectionProxies.js";
import { StorageService } from "../storage.service.js";

export const connectionProxiesRoutes = (storage: StorageService) => async (app: FastifyInstance) => {
  registerCrudRoutes(app, storage.connectionProxies, ConnectionProxySchema);
};