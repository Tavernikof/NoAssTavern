import { z } from "zod";
import { AbstractStorage } from "../utils/AbstractStorage.js";
import { StorageService } from "../storage.service.js";

export const LoreBookEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  active: z.boolean(),
  conditions: z.array(z.object({
    type: z.string(),
    keywords: z.array(z.string()),
  })),
  strategy: z.string(), // TODO: ADD ENUM
  position: z.string(),
  depth: z.number().nullish(),
  content: z.string(),
});

export const LoreBookSchema = z.object({
  id: z.string(),
  createdAt: z.iso.datetime(),
  name: z.string(),
  depth: z.number(),
  entries: z.array(LoreBookEntrySchema),
});

export type LoreBook = z.infer<typeof LoreBookSchema>;

export class LoreBooksStorage extends AbstractStorage<LoreBook> {
  constructor(readonly storageService: StorageService) {
    super("loreBooks", LoreBookSchema);
  }
}