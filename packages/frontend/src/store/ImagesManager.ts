import { imagesStorage } from "src/storages/ImagesStorage.ts";
import { v4 as uuid } from "uuid";
import { action, makeObservable, observable, runInAction } from "mobx";
import { globalSettings } from "src/store/GlobalSettings.ts";
import { backendManager } from "src/store/BackendManager.ts";

export class ImagesManager {
  private temp: Record<string, string> = {};
  @observable cache: Record<string, string | null> = {};

  constructor() {
    makeObservable(this);
  }

  getItem(id: string) {
    if (this.cache[id] !== undefined) return Promise.resolve();
    if (globalSettings.isBackendEnabled) {
      runInAction(() => {
        this.cache[id] = this.getImageUrl(id);
      });
      return Promise.resolve();
    } else {
      return imagesStorage.getItem(id).then(action((item) => {
        this.cache[id] = item
          ? URL.createObjectURL(item.image)
          : null;
      }));
    }
  }

  async saveBlob(blob: Blob) {
    const id = uuid();
    await imagesStorage.updateItem({ id, createdAt: new Date(), image: blob });
    if (!globalSettings.isBackendEnabled) {
      this.cache[id] = URL.createObjectURL(blob);
    }
    return id;
  }

  async saveBase64(data: string, mimeType: string) {
    const dataUrl = `data:${mimeType};base64,${data}`;
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return this.saveBlob(blob);
  }

  saveTempItem(id: string) {
    const oldId = this.temp[id];
    if (!oldId) return;
    if (globalSettings.isBackendEnabled) {
      backendManager.apiRequest({
        method: "POST",
        url: `storage/images/${oldId}/clone/${id}`,
      }).then(resp => resp.data);
    } else {
      imagesStorage.getItem(oldId).then((item) => {
        imagesStorage.updateItem({ id, createdAt: new Date(), image: item.image });
      });
    }
    delete this.temp[id];
  }

  cloneItem(id: string) {
    const newId = uuid();
    this.temp[newId] = id;

    this.cache[newId] = null;
    if (globalSettings.isBackendEnabled) {
      this.cache[newId] = this.getImageUrl(id);
    } else {
      imagesStorage.getItem(id).then(action(item => {
        if (!item) return;
        this.cache[newId] = URL.createObjectURL(item.image);
      }));
    }

    return newId;
  }

  getImageUrl(id: string) {
    return `${globalSettings.backendUrl}/api/storage/images/${id}`;
  }
}

export const imagesManager = new ImagesManager();
window.imagesManager = imagesManager;
