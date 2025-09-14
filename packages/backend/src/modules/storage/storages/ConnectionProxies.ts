import { z } from "zod";
import { AbstractStorage } from "../utils/AbstractStorage.js";
import { StorageService } from "../storage.service.js";

export const ConnectionProxySchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  name: z.string(),
  baseUrl: z.string(),
  key: z.string(),
  modelsEndpoint: z.string(),
  models: z.array(z.string()).nullish(),
});

export type ConnectionProxy = z.infer<typeof ConnectionProxySchema>;

export class ConnectionProxiesStorage extends AbstractStorage<ConnectionProxy> {
  constructor(readonly storageService: StorageService) {
    super("connectionProxies", ConnectionProxySchema);
  }
}