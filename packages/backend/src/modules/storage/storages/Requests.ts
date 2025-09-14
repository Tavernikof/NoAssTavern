import { z } from "zod";
import { AbstractStorage } from "../utils/AbstractStorage.js";
import path from "path";
import { STORAGE_DIR } from "../../../env.js";
import { Message } from "./Messages.js";
import { StorageService } from "../storage.service.js";

export const BackendProviderGenerateResponseSchema = z.object({
  message: z.string(),
  error: z.string().nullish(),
  inputTokens: z.number(),
  outputTokens: z.number(),
  url: z.string(),
  request: z.looseObject({}),
});

export const RequestSchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  provider: z.string(), // TODO: add enum
  response: BackendProviderGenerateResponseSchema,
});

export type Request = z.infer<typeof RequestSchema>;

export class RequestsStorage extends AbstractStorage<Request> {
  constructor(readonly storageService: StorageService) {
    super("requests", RequestSchema);
  }
}