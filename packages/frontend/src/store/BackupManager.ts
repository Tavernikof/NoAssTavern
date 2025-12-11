import { backendManager } from "src/store/BackendManager.ts";
import { extractAxiosError } from "src/helpers/getAxiosError.ts";
import { BaseStorage } from "src/storages/baseStorage/BaseStorage.ts";
import { globalSettings } from "src/store/GlobalSettings.ts";
import { BackendStorageType } from "src/enums/BackendStorageType.ts";
import { runInAction } from "mobx";
import { BlobWriter, ZipWriter, BlobReader, ZipReader } from "@zip.js/zip.js";

export class BackupManager {
  constructor() {
  }

  private getModules() {
    return Promise.all([
      import("src/storages/AssistantChatsStorage"),
      import("src/storages/AssistantMessageStorage"),
      import("src/storages/CharactersStorage"),
      import("src/storages/ChatsStorage"),
      import("src/storages/ConnectionProxiesStorage"),
      import("src/storages/FlowsStorage"),
      import("src/storages/GlobalSettingsStorage"),
      import("src/storages/ImagesStorage"),
      import("src/storages/LoreBookStorage"),
      import("src/storages/MessageStorage"),
      import("src/storages/PromptsStorage"),
      import("src/storages/RequestStorage"),
    ] as const);
  }

  async enableBackendStorage(backendUrl: string, withUpload?: boolean) {
    try {
      if (withUpload) {
        const data = await this.serializeLocalAll();
        await this.uploadToBackendStorage(data, backendUrl);
      }
      runInAction(() => {
        globalSettings.backendUrl = backendUrl;
        globalSettings.storageType = BackendStorageType.backend;
      });
      window.location.reload();
    } catch (error) {
      this.alertError(error);
    }
  }

  async enableInBrowserStorage() {
    try {
      const { data: rawData } = await this.downloadFromBackendStorage();
      runInAction(() => globalSettings.tempStorageType = BackendStorageType.indexedDB);
      await this.importBackup(rawData);

      runInAction(() => {
        globalSettings.tempStorageType = null;
        globalSettings.storageType = BackendStorageType.indexedDB;
      });

      window.location.reload();
    } catch (error) {
      runInAction(() => globalSettings.tempStorageType = BackendStorageType.backend);
      this.alertError(error);
    }
  }

  async exportAllToFile() {
    try {
      const data = globalSettings.isBackendEnabled
        ? (await this.downloadFromBackendStorage()).data
        : await this.serializeLocalAll();

      const url = URL.createObjectURL(data);

      const a = document.createElement("a");
      a.href = url;
      a.download = "noasstavern-export.zip";
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      this.alertError(error);
    }
  }

  async importAllDataFromFile(file: File) {
    try {
      if (globalSettings.isBackendEnabled) {
        await this.uploadToBackendStorage(file);
      } else {
        await this.importBackup(file);
      }
      window.location.reload();
    } catch (error) {
      this.alertError(error);
    }
  }

  private uploadToBackendStorage(data: Blob, backendUrl?: string) {
    const formData = new FormData();
    formData.append("file", data, "archive.zip");

    return backendManager.apiRequest({
      method: "POST",
      url: "storage/migrate",
      headers: { "Content-Type": "multipart/form-data" },
      data: formData,
      baseURL: backendUrl,
    }).catch(extractAxiosError);
  }

  private downloadFromBackendStorage(backendUrl?: string) {
    return backendManager.apiRequest<Blob>({
      method: "GET",
      url: "storage/migrate",
      responseType: "blob",
      baseURL: backendUrl,
    }).catch(extractAxiosError);
  }

  private async serializeLocalAll() {
    const storages = await this.getStorages();

    const writer = new BlobWriter("application/zip");
    const zipWriter = new ZipWriter(writer, { bufferedWrite: true });

    await Promise.all(storages.map(storage => {
      return storage.getItems().then((items) => {
        return Promise.all(items.map(item => {
          return storage.archiveEntry(item, zipWriter);
        }));
      });
    }));
    return zipWriter.close();
  }

  private async getStorages() {
    const modules = await this.getModules();

    const storages: BaseStorage[] = modules.map(module => {
      for (const i in module) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-expect-error
        const object = module[i];
        if (typeof object === "object") {
          return object;
        }
      }
    });
    return storages;
  }

  private async importBackup(file: Blob) {
    const storages = await this.getStorages();

    const reader = new ZipReader(new BlobReader(file));
    const entries = await reader.getEntries();

    try {
      for (const entry of entries) {
        if (entry.directory) continue;

        for (const storage of storages) {
          if (await storage.importEntry(entry)) break;
        }
      }
    } catch (e) {
      console.log(e);
    }

    await reader.close();
  }

  private alertError(error: unknown) {
    const errorStr = error
      ? typeof error === "string"
        ? error
        : typeof error === "function" && "message" in error
          ? error.message
          : error.toString()
      : "unknown error";
    console.error(error);
    alert(errorStr);
  }
}

export const backupManager = new BackupManager();
window.backupManager = backupManager;