import { StorageService } from "../storage.service.js";
import staticServe from "@fastify/static";
import { z } from "zod";
import { ZodFastifyInstance } from "../../../server.js";
import glob from "fast-glob";

const paramsSchema = z.object({
  id: z.uuid(),
});

const cloneParamsSchema = z.object({
  existId: z.uuid(),
  newId: z.uuid(),
});

export const imagesRoutes = (storage: StorageService) => async (app: ZodFastifyInstance) => {

  app.register(staticServe, {
    root: storage.images.imagesDir,
    prefix: "/",
  });

  app.get("/:id", { schema: { params: paramsSchema } }, async (req, reply) => {
    const { id } = req.params;
    const matches = await glob(`${id}.*`, { cwd: storage.images.imagesDir });
    const fileName = matches[0];
    if (!fileName) return reply.status(400).send({ error: "No file" });
    return reply.sendFile(fileName);
  });


  app.post("/:id", { schema: { params: paramsSchema } }, async (req, reply) => {
    const { id } = req.params;
    const file = await req.file();
    if (!file) return reply.status(400).send({ error: "No file" });

    const buffer = await file.toBuffer();
    await storage.images.create(id, buffer);
  });

  app.post("/:existId/clone/:newId", { schema: { params: cloneParamsSchema } }, async (req, reply) => {
    const { existId, newId } = req.params;
    await storage.images.clone(existId, newId);
  });

  app.delete("/:id", { schema: { params: paramsSchema } }, async (req) => {
    const { id } = req.params;
    const ok = await storage.images.removeFile(id);
    return { success: ok };
  });
};