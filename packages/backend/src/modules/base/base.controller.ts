import { FastifyInstance } from "fastify";
import { BaseService } from "./base.service.js";

export async function baseRoutes(app: FastifyInstance) {
  const service = new BaseService();

  app.get("/info", async (req, reply) => {
    return {
      status: "ok",
    };
  });
}