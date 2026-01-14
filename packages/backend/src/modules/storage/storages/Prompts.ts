import { z } from "zod";
import { AbstractStorage } from "../utils/AbstractStorage.js";
import { StorageService } from "../storage.service.js";
import { CodeBlockSchema } from "./CodeBlocks.js";

export const PresetBlockContentSchema = z.object({
  active: z.boolean(),
  name: z.string().nullish(),
  content: z.string(),
});

export const PromptBlockSchema = z.object({
  role: z.string(),
  content: z.array(PresetBlockContentSchema),
});

export const PromptSchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  name: z.string(),
  blocks: z.array(PromptBlockSchema),
  backendProviderId: z.string(),
  connectionProxyId: z.string().nullish(),
  model: z.string(),
  generationConfig: z.looseObject({}),
  codeBlocks: z.array(z.object({
    codeBlock: CodeBlockSchema,
    active: z.boolean(),
  })),
});

export type Prompt = z.infer<typeof PromptSchema>;

export class PromptsStorage extends AbstractStorage<Prompt> {
  constructor(readonly storageService: StorageService) {
    super("prompts", PromptSchema);
  }
}