import { FastifyInstance } from "fastify";
import { FlowSchema } from "../storages/Flows.js";
import { registerCrudRoutes } from "../utils/registerCrudRoutes.js";
import { StorageService } from "../storage.service.js";

export const flowsRoutes = (storage: StorageService) => async (app: FastifyInstance) => {
  registerCrudRoutes(app, storage.flows, FlowSchema);
};