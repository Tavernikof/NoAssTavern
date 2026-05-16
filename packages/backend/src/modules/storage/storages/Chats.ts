import { z } from "zod";
import { AbstractStorage } from "../utils/AbstractStorage.js";
import { CharacterSchema } from "./Characters.js";
import { LoreBookSchema } from "./LoreBooks.js";
import { FlowSchema } from "./Flows.js";
import { MediaFileSchema } from "./MediaFile.js";
import { StorageService } from "../storage.service.js";
import fs from "fs/promises";
import path from "path";

export const ChatSchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  name: z.string(),
  scenario: z.string(),
  characters: z.array(z.object({
    character: CharacterSchema,
    active: z.boolean(),
  })),
  persona: z.string(),
  loreBooks: z.array(z.object({
    loreBook: LoreBookSchema,
    active: z.boolean(),
  })),
  impersonate: z.string().nullish(),
  impersonateHistory: z.array(z.string()).nullish(),
  flow: FlowSchema,
  variables: z.looseObject({}).optional(),
  mediaFiles: z.array(MediaFileSchema).optional(),
});

export type Chat = z.infer<typeof ChatSchema>;

export class ChatsStorage extends AbstractStorage<Chat> {
  constructor(readonly storageService: StorageService) {
    super("chats", ChatSchema);
  }

  async delete(id: string): Promise<boolean> {
    const result = await super.delete(id);
    await fs.rm(path.resolve(this.storageService.messages.baseChatsDir, id), { recursive: true }).catch(() => {});
    return result;
  }

}