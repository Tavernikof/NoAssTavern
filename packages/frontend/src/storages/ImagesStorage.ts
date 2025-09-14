import { BaseStorage } from "./baseStorage/BaseStorage.ts";
import { IDBPDatabase } from "idb";
import { globalSettings } from "src/store/GlobalSettings.ts";
import { backendManager } from "src/store/BackendManager.ts";
import { Entry, ZipWriter } from "@zip.js/zip.js";

export type ImageStorageItem = {
  id: string;
  createdAt: Date;
  image: Blob;
}

export class ImagesStorage extends BaseStorage<ImageStorageItem> {
  slug = "images";
  migrations = [
    (db: IDBPDatabase) => {
      const store = db.createObjectStore(this.slug, { keyPath: "id" });
      store.createIndex("createdAt", "createdAt");
    },
  ];

  async updateItem(item: ImageStorageItem) {
    if (globalSettings.isBackendEnabled) {
      const formData = new FormData();
      formData.append("files", item.image);

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
    const blobWriter = new (await import("@zip.js/zip.js")).BlobWriter("image/jpeg");
    const data = await entry.getData(blobWriter);
    if (!data) return false;
    const entity: ImageStorageItem = { id: match[1], createdAt: new Date(), image: data };
    await this.updateItem(entity);
    return true;
  }

  async archiveEntry(item: ImageStorageItem, zipWriter: ZipWriter<any>) {
    const image = item.image;
    const ext = image.type.split("/")[1];
    // Safari has a bug with reading blobs received through a cursor, so we need to refetch if from indexedDB
    item = await imagesStorage.getItem(item.id);
    const blobReader = new (await import("@zip.js/zip.js")).BlobReader(item.image);
    return zipWriter.add(`${this.slug}/${item.id}.${ext}`, blobReader);
  }
}

export const imagesStorage = new ImagesStorage();
