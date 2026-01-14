import { z } from "zod";
import { AbstractStorage } from "../utils/AbstractStorage.js";
import { StorageService } from "../storage.service.js";

export const CodeBlockSchema = z.object({
  id: z.string(),
  createdAt: z.iso.datetime(),
  name: z.string(),
  content: z.string(),
});

export type CodeBlock = z.infer<typeof CodeBlockSchema>;

export class CodeBlocksStorage extends AbstractStorage<CodeBlock> {
  constructor(readonly storageService: StorageService) {
    super("codeBlocks", CodeBlockSchema);
  }
}