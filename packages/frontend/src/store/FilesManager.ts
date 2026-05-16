import { filesStorage } from "src/storages/FilesStorage.ts";
import { v4 as uuid } from "uuid";
import { action, makeObservable, observable, runInAction } from "mobx";
import { globalSettings } from "src/store/GlobalSettings.ts";
import { backendManager } from "src/store/BackendManager.ts";

export class FilesManager {
  private temp: Record<string, string> = {};
  @observable cache: Record<string, string | null> = {};

  constructor() {
    makeObservable(this);
  }

  getItem(id: string) {
    if (this.cache[id] !== undefined) return Promise.resolve();
    if (globalSettings.isBackendEnabled) {
      runInAction(() => {
        this.cache[id] = this.getFileUrl(id);
      });
      return Promise.resolve();
    } else {
      return filesStorage.getItem(id).then(action((item) => {
        this.cache[id] = item
          ? URL.createObjectURL(item.file)
          : null;
      }));
    }
  }

  async saveBlob(blob: Blob, name: string, mimeType: string) {
    const id = uuid();
    await filesStorage.updateItem({
      id,
      createdAt: new Date(),
      file: blob,
      name,
      mimeType,
    });
    if (!globalSettings.isBackendEnabled) {
      this.cache[id] = URL.createObjectURL(blob);
    }
    return id;
  }

  async removeItem(id: string) {
    if (globalSettings.isBackendEnabled) {
      await backendManager.apiRequest({
        method: "DELETE",
        url: `storage/files/${id}`,
      });
    } else {
      await filesStorage.removeItem(id);
    }
    runInAction(() => {
      delete this.cache[id];
    });
  }

  saveTempItem(id: string) {
    const oldId = this.temp[id];
    if (!oldId) return;
    if (globalSettings.isBackendEnabled) {
      backendManager.apiRequest({
        method: "POST",
        url: `storage/files/${oldId}/clone/${id}`,
      }).then(resp => resp.data);
    } else {
      filesStorage.getItem(oldId).then((item) => {
        filesStorage.updateItem({
          id,
          createdAt: new Date(),
          file: item.file,
          name: item.name,
          mimeType: item.mimeType,
        });
      });
    }
    delete this.temp[id];
  }

  cloneItem(id: string) {
    const newId = uuid();
    this.temp[newId] = id;

    this.cache[newId] = null;
    if (globalSettings.isBackendEnabled) {
      this.cache[newId] = this.getFileUrl(id);
    } else {
      filesStorage.getItem(id).then(action(item => {
        if (!item) return;
        this.cache[newId] = URL.createObjectURL(item.file);
      }));
    }

    return newId;
  }

  getFileUrl(id: string) {
    return `${globalSettings.backendUrl}/api/storage/files/${id}`;
  }

  async getFileText(id: string): Promise<string> {
    if (globalSettings.isBackendEnabled) {
      const response = await fetch(this.getFileUrl(id));
      return response.text();
    }
    const item = await filesStorage.getItem(id);
    return item ? item.file.text() : "";
  }
}

export const filesManager = new FilesManager();
window.filesManager = filesManager;
