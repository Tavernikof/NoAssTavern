import { z } from "zod";
import path from "path";
import { STORAGE_DIR } from "../../../env.js";
import { StorageService } from "../storage.service.js";
import fs from "fs";
import { Entry, TextWriter } from "@zip.js/zip.js";

export const GlobalSettingsSchema = z.object({
  seedsImported: z.boolean().default(false),
  openaiKey: z.string().default(""),
  geminiKey: z.string().default(""),
  claudeKey: z.string().default(""),
  proxyRequestsThroughBackend: z.boolean().default(false),
  socks5: z.string().default(""),
});

export type GlobalSettings = z.infer<typeof GlobalSettingsSchema>;

export class GlobalSettingsStorage {
  private fileName = "global-settings.json";
  private settingsPath = path.resolve(STORAGE_DIR, this.fileName);

  constructor(readonly storageService: StorageService) {

  }

  async get(): Promise<GlobalSettings> {
    try {

      const raw = await fs.promises.readFile(this.settingsPath, "utf-8");
      const parsedJson = JSON.parse(raw);
      return GlobalSettingsSchema.parse(parsedJson);
    } catch (e) {
      return Promise.resolve({
        seedsImported: false,
        openaiKey: "",
        geminiKey: "",
        claudeKey: "",
        proxyRequestsThroughBackend: false,
        socks5: "",
      });
    }
  }

  async save(data: GlobalSettings) {
    const obj = await this.get();
    const updated = { ...obj, ...data };
    const parsed = GlobalSettingsSchema.parse(updated);
    await fs.promises.writeFile(this.settingsPath, JSON.stringify(parsed, null, 2), "utf-8");
    return parsed;
  }

  async importEntry(entry: Entry) {
    if (!entry.getData || entry.filename !== this.fileName) return false;
    const textWriter = new TextWriter();
    const data = await entry.getData(textWriter);
    const entity = JSON.parse(data);
    if (!entity) return false;
    await this.save(entity);
    return true;
  }
}