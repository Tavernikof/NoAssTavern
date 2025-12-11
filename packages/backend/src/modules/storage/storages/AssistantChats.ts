import { z } from "zod";
import { AbstractStorage } from "../utils/AbstractStorage.js";
import { StorageService } from "../storage.service.js";
import fs from "fs/promises";
import path from "path";

export const AssistantChatSchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  name: z.string(),
  generationSettings: z.object({
    backendProviderId: z.string(),
    connectionProxyId: z.string().nullish(),
    model: z.string().nullish(),
    generationConfig: z.looseObject({}),
  }).nullish(),
});

export type AssistantChat = z.infer<typeof AssistantChatSchema>;

export class AssistantChatsStorage extends AbstractStorage<AssistantChat> {
  constructor(readonly storageService: StorageService) {
    super("assistantChats", AssistantChatSchema);
  }

  async delete(id: string): Promise<boolean> {
    const result = await super.delete(id);
    await fs.rm(path.resolve(this.storageService.assistantMessages.baseChatsDir, id), { recursive: true }).catch(() => {});
    return result;
  }

}