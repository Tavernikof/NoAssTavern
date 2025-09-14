import { z } from "zod";
import { AbstractStorage } from "./AbstractStorage.js";
import { ZodFastifyInstance } from "../../../server.js";

export function registerCrudRoutes<T extends { id: string, createdAt: string }>(
  app: ZodFastifyInstance,
  service: AbstractStorage<T>,
  schema: z.ZodType<T>,
) {
  const paramsSchema = z.object({
    id: z.uuid(),
  });

  app.get("/", async () => {
    return service.list();
  });

  app.get("/:id", { schema: { params: paramsSchema } }, async (req, reply) => {
    const { id } = req.params;
    const item = await service.get(id);
    if (!item) {
      return reply.status(404).send({ error: "Not found" });
    }
    return item;
  });

  app.post("/", { schema: { body: schema } }, async (req) => {
    const id = (req.body as { id: string }).id;
    return service.create(id, req.body as T);
  });

  app.delete("/:id", { schema: { params: paramsSchema } }, async (req) => {
    const { id } = req.params;
    const ok = await service.delete(id);
    return { success: ok };
  });
}