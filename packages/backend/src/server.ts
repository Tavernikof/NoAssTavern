import Fastify, {
  FastifyInstance,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import multipart from "@fastify/multipart";
import { proxyRoutes } from "./modules/proxy/proxy.controller.js";
import { baseRoutes } from "./modules/base/base.controller.js";
import { storageRoutes } from "./modules/storage/storage.controller.js";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import staticServe from "@fastify/static";
import * as path from "path";
import { APP_ROOT } from "./env.js";

export type ZodFastifyInstance = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  any,
  ZodTypeProvider
>;

export async function buildServer() {
  const app = Fastify({ logger: false })
    .withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.register(multipart, { limits: { fileSize: Number.MAX_SAFE_INTEGER } });
  app.register(cors, { origin: true, methods: ["GET", "HEAD", "POST", "DELETE"] });
  app.register(websocket);

  app.register(async (api) => {
    api.register(baseRoutes, { prefix: "/base" });
    api.register(proxyRoutes, { prefix: "/proxy" });
    api.register(storageRoutes, { prefix: "/storage" });
  }, { prefix: "/api" });

  app.register(staticServe, {
    root: path.resolve(APP_ROOT, "packages", "frontend", "dist"),
    prefix: "/",
  });

  app.register(staticServe, {
    root: path.resolve(APP_ROOT, "packages", "docs", ".vitepress", "dist"),
    prefix: "/docs",
    decorateReply: false,
  });

  return app;
}