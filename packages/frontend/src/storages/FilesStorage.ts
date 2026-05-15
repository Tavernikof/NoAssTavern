import { BaseStorage } from "./baseStorage/BaseStorage.ts";
import { IDBPDatabase } from "idb";
import { globalSettings } from "src/store/GlobalSettings.ts";
import { backendManager } from "src/store/BackendManager.ts";
import { Entry, ZipWriter } from "@zip.js/zip.js";

export type FileStorageItem = {
  id: string;
  createdAt: Date;
  file: Blob;
  name: string;
  mimeType: string;
}

export class FilesStorage extends BaseStorage<FileStorageItem> {
  slug = "files";
  migrations = [
    (db: IDBPDatabase) => {
      const store = db.createObjectStore(this.slug, { keyPath: "id" });
      store.createIndex("createdAt", "createdAt");
    },
  ];

  async updateItem(item: FileStorageItem) {
    if (globalSettings.isBackendEnabled) {
      const formData = new FormData();
      formData.append("files", item.file, item.name);

      return backendManager.apiRequest<any>({
        method: "POST",
        url: `storage/${this.slug}/${item.id}`,
        data: formData,
      }).then(resp => resp.data);
    }
    return super.updateItem(item);
  }

  async importEntry(entry: Entry) {
    const regExp = new RegExp(`${this.slug}/([a-zA-Z0-9\\-]+)\\.([a-zA-Z0-9]+)`, "");
    const match = entry.filename.match(regExp);
    if (!match || !entry.getData) return false;
    const blobWriter = new (await import("@zip.js/zip.js")).BlobWriter();
    const data = await entry.getData(blobWriter);
    if (!data) return false;
    const entity: FileStorageItem = {
      id: match[1],
      createdAt: new Date(),
      file: data,
      name: `${match[1]}.${match[2]}`,
      mimeType: data.type || "application/octet-stream",
    };
    await this.updateItem(entity);
    return true;
  }

  async archiveEntry(item: FileStorageItem, zipWriter: ZipWriter<any>) {
    const fresh = await filesStorage.getItem(item.id);
    const blob = fresh.file;
    const extFromName = (fresh.name || "").split(".").pop();
    const extFromMime = (blob.type || "").split("/")[1];
    const ext = extFromName || extFromMime || "bin";
    const blobReader = new (await import("@zip.js/zip.js")).BlobReader(blob);
    return zipWriter.add(`${this.slug}/${item.id}.${ext}`, blobReader);
  }
}

export const filesStorage = new FilesStorage();
