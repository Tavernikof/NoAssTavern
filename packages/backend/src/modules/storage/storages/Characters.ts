import { z } from "zod";
import { AbstractStorage } from "../utils/AbstractStorage.js";
import { LoreBookSchema } from "./LoreBooks.js";
import { StorageService } from "../storage.service.js";

export const CharacterSchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  name: z.string(),
  description: z.string(),
  scenario: z.string(),
  greetings: z.array(z.string()),
  loreBook: LoreBookSchema.nullish(),
  imageId: z.string().nullish(),
  card: z.looseObject({}).nullish(),
});

export type Character = z.infer<typeof CharacterSchema>;

export class CharactersStorage extends AbstractStorage<Character> {
  constructor(readonly storageService: StorageService) {
    super("characters", CharacterSchema);
  }
}