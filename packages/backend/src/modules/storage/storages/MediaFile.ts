import { z } from "zod";

export const MediaFileSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  mimeType: z.string(),
  size: z.number(),
  createdAt: z.iso.datetime(),
});

export type MediaFile = z.infer<typeof MediaFileSchema>;
