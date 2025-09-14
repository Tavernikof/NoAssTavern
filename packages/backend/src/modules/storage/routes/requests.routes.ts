import { FastifyInstance } from "fastify";
import { registerCrudRoutes } from "../utils/registerCrudRoutes.js";
import { RequestSchema } from "../storages/Requests.js";
import { StorageService } from "../storage.service.js";

export const requestsRoutes = (storage: StorageService) => async (app: FastifyInstance) => {
  registerCrudRoutes(app, storage.requests, RequestSchema);
};