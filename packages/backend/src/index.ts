import "./env.js";
import { buildServer } from "./server.js";
import { killExistProcess } from "./utils/killExistProcess.js";

(async () => {
  try {
    const app = await buildServer();

    await killExistProcess(Number(process.env.BACKEND_PORT));

    await app.listen({
      port: Number(process.env.BACKEND_PORT),
      host: process.env.BACKEND_HOST,
    });

    process.on("SIGINT", async () => {
      await app?.close();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      await app?.close();
      process.exit(0);
    });

    console.log("============================================================");
    console.log(`Application running at: ${process.env.BACKEND_URL}`);
    console.log("============================================================");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

