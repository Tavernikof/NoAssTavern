import { z } from "zod";
import { AbstractStorage } from "../utils/AbstractStorage.js";
import { PromptSchema } from "./Prompts.js";
import { StorageService } from "../storage.service.js";

export const FlowSchemeNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.looseObject({}),
});

export const FlowSchemeEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
});

export const FlowSchemeStateSchema = z.object({
  nodes: z.array(FlowSchemeNodeSchema),
  edges: z.array(FlowSchemeEdgeSchema),
});

export const FlowExtraBlockSchema = z.object({
  id: z.uuid(),
  key: z.string(),
});

export const FlowSchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  name: z.string(),
  userPrefix: z.string(),
  schemes: z.object().catchall(FlowSchemeStateSchema),
  extraBlocks: z.array(FlowExtraBlockSchema),
  prompts: z.array(PromptSchema),
});

export type Flow = z.infer<typeof FlowSchema>;

export class FlowsStorage extends AbstractStorage<Flow> {
  constructor(readonly storageService: StorageService) {
    super("flows", FlowSchema);
  }
}