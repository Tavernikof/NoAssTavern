import { Entry, ZipWriter } from "@zip.js/zip.js";
import parseJSON from "src/helpers/parseJSON.ts";
import { globalSettings } from "src/store/GlobalSettings.ts";
import { backendManager } from "src/store/BackendManager.ts";

export type GlobalSettingsStorageItem = {
  seedsImported: boolean;
  openaiKey: string;
  geminiKey: string;
  claudeKey: string;
  proxyRequestsThroughBackend: boolean;
  socks5: string;
  notificationFile: string | null;
}

export class GlobalSettingsStorage {
  private fileName = "global-settings.json";
  private stateKey = "noass-tavern-global-settings";

  async get() {
    if (globalSettings.isBackendEnabled) {
      return backendManager.apiRequest<GlobalSettingsStorageItem>({
        method: "GET",
        url: `storage/globalSettings`,
      }).then(resp => resp.data);
    } else {
      return Promise.resolve(parseJSON(localStorage[this.stateKey]) as GlobalSettingsStorageItem);
    }
  }

  async save(data: GlobalSettingsStorageItem) {
    if (globalSettings.isBackendEnabled) {
      return backendManager.apiRequest({
        method: "POST",
        url: `storage/globalSettings`,
        data: data,
      }).then(resp => resp.data);
    } else {
      localStorage[this.stateKey] = JSON.stringify(data);
      return Promise.resolve();
    }
  }

  // compatibility with BaseStorage
  async getItems() {
    return [this.get()];
  }

  async importEntry(entry: Entry) {
    if (!entry.getData || entry.filename !== this.fileName) return false;
    const textWriter = new (await import("@zip.js/zip.js")).TextWriter();
    const data = await entry.getData(textWriter);
    const entity = parseJSON(data);
    if (!entity) return false;
    await this.save(entity);
    return true;
  }

  async archiveEntry(item: GlobalSettingsStorageItem, zipWriter: ZipWriter<any>) {
    const json = JSON.stringify(item, null, 2);
    const textReader = new (await import("@zip.js/zip.js")).TextReader(json);
    return zipWriter.add(this.fileName, textReader);
  }
}

export const globalSettingsStorage = new GlobalSettingsStorage();
