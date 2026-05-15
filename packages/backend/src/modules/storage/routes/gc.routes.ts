import { StorageService } from "../storage.service.js";
import { ZodFastifyInstance } from "../../../server.js";
import { GarbageCollectorService } from "../gc.service.js";

export const gcRoutes = (storage: StorageService) => async (app: ZodFastifyInstance) => {
  const gc = new GarbageCollectorService(storage);

  app.get("/scan", async () => {
    return gc.scanSummary();
  });

  app.post("/delete", async () => {
    return gc.deleteOrphans();
  });
};
