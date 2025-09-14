import { IDBPDatabase } from "idb";
import { IndexedDBStorage } from "./IndexedDBStorage.ts";
import { BackendStorage } from "./BackendStorage.ts";
import { globalSettings } from "src/store/GlobalSettings.ts";
import { Entry, ZipWriter } from "@zip.js/zip.js";
import parseJSON from "src/helpers/parseJSON.ts";

export abstract class BaseStorage<I extends { id: string, createdAt: Date } = { id: string, createdAt: Date }> {
  abstract slug: string;
  abstract migrations: ((db: IDBPDatabase) => void)[];

  private indexedDBStorage: IndexedDBStorage<I>;
  private backendStorage: BackendStorage<I>;

  constructor() {}

  protected getStorage() {
    return globalSettings.isBackendEnabled
      ? this.getBackendStorage()
      : this.getIndexedDBStorage();
  }

  private getIndexedDBStorage() {
    if (!this.indexedDBStorage) {
      this.indexedDBStorage = new IndexedDBStorage<I>(this.slug, this.migrations);
    }
    return this.indexedDBStorage;
  }

  private getBackendStorage() {
    if (!this.backendStorage) {
      this.backendStorage = new BackendStorage<I>(this.slug);
    }
    return this.backendStorage;
  }

  async getItems() {
    return this.getStorage().getItems();
  }

  async getItem(id: string) {
    return this.getStorage().getItem(id);
  }

  async updateItem(value: I) {
    return this.getStorage().updateItem(value);
  }

  async removeItem(id: string) {
    return this.getStorage().removeItem(id);
  }

  async importEntry(entry: Entry) {
    const regExp = new RegExp(`${this.slug}/([a-zA-Z0-9\\-]+)\\.([a-zA-Z0-9]+)`, "");
    const match = entry.filename.match(regExp);
    if (!match || !entry.getData) return false;
    const textWriter = new (await import("@zip.js/zip.js")).TextWriter();
    const data = await entry.getData(textWriter);
    const entity = parseJSON(data);
    if (!entity) return false;
    if (typeof entity.createdAt === "string") entity.createdAt = new Date(entity.createdAt);
    await this.updateItem(entity);
    return true;
  }

  async archiveEntry(item: I, zipWriter: ZipWriter<any>) {
    const json = JSON.stringify(item, null, 2);
    const textReader = new (await import("@zip.js/zip.js")).TextReader(json);
    return zipWriter.add(`${this.slug}/${item.id}.json`, textReader);
  }
}