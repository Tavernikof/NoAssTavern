import { FastifyInstance } from "fastify";
import { pipeline } from "stream/promises";
import { request, Dispatcher, ProxyAgent } from "undici";
import { ProxyService } from "./proxy.service.js";

export async function proxyRoutes(app: FastifyInstance) {
  const service = new ProxyService();

  app.removeContentTypeParser("application/json");

  app.addContentTypeParser("*", { parseAs: "buffer" }, (req, body, done) => {
    done(null, body);
  });

  app.post("/", async (req, reply) => {
    const targetUrl = req.headers["x-proxy-url"]?.toString();
    const targetMethod = (req.headers["x-proxy-method"]?.toString() || "GET").toUpperCase();
    const socksProxyUrl = req.headers["x-proxy-sock5"];

    if (!targetUrl) {
      reply.code(400).send({ error: "x-proxy-url header required" });
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const onClose = () => controller.abort();
    reply.raw.on("close", onClose);

    let dispatcher: Dispatcher | undefined = undefined;
    if (typeof socksProxyUrl === "string" && socksProxyUrl) {
      dispatcher = new ProxyAgent({ uri: socksProxyUrl });
    }

    try {
      const { statusCode, headers, body } = await request(targetUrl, {
        method: targetMethod,
        body: req.body as Buffer,
        signal,
        dispatcher,
        headers: {
          ...req.headers,
          "x-proxy-url": undefined,
          "x-proxy-method": undefined,
          "x-proxy-sock5": undefined,
          "host": undefined,
        },
      });

      const proxiedHeaders = {
        ...headers,
        "access-control-allow-origin": "*",
        "access-control-allow-headers": "*",
        "access-control-allow-methods": "*",
      };

      reply.raw.writeHead(statusCode, proxiedHeaders);

      await pipeline(body, reply.raw);
    } catch (err) {
      console.error(err);
      if (typeof err === "object" && err !== null &&
        (("name" in err && err.name === "AbortError") || ("code" in err && err.code === "UND_ERR_ABORTED"))) {
        req.log.info("Proxy request was successfully aborted.");
      } else {
        req.log.error(err, "Proxy request failed");
        if (!reply.sent) {
          reply.code(502).send({ error: "Proxy request failed" });
        }
      }
    } finally {
      reply.raw.removeListener("close", onClose);
    }

    return reply;
  });
}