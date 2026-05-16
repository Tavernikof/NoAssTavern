import { action, makeObservable, observable, runInAction } from "mobx";
import { globalSettings } from "src/store/GlobalSettings.ts";
import { backendManager } from "src/store/BackendManager.ts";
import { filesStorage } from "src/storages/FilesStorage.ts";
import { flowsStorage } from "src/storages/FlowsStorage.ts";
import { charactersStorage } from "src/storages/CharactersStorage.ts";
import { chatsStorage } from "src/storages/ChatsStorage.ts";

const GRACE_MS = 24 * 60 * 60 * 1000;

export type CleanupStatus = "idle" | "scanning" | "scanned" | "deleting" | "done" | "error";

export type CleanupSummary = {
  filesCount: number;
  filesSize: number;
};

type BackendScanResponse = {
  files: { count: number; size: number };
};

type BackendDeleteResponse = {
  filesDeleted: number;
  bytesFreed: number;
};

export class StorageCleanupController {
  @observable status: CleanupStatus = "idle";
  @observable summary: CleanupSummary | null = null;
  @observable bytesFreed: number | null = null;
  @observable error: string | null = null;

  constructor() {
    makeObservable(this);
  }

  @action.bound
  reset() {
    this.status = "idle";
    this.summary = null;
    this.bytesFreed = null;
    this.error = null;
  }

  @action.bound
  async scan() {
    this.status = "scanning";
    this.error = null;
    this.summary = null;
    this.bytesFreed = null;

    try {
      const summary = globalSettings.isBackendEnabled
        ? await this.scanBackend()
        : await this.scanLocal();

      runInAction(() => {
        this.summary = summary;
        this.status = "scanned";
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : String(error);
        this.status = "error";
      });
    }
  }

  @action.bound
  async delete() {
    if (!this.summary) return;
    this.status = "deleting";
    this.error = null;

    try {
      const bytesFreed = globalSettings.isBackendEnabled
        ? await this.deleteBackend()
        : await this.deleteLocal();

      runInAction(() => {
        this.bytesFreed = bytesFreed;
        this.summary = null;
        this.status = "done";
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : String(error);
        this.status = "error";
      });
    }
  }

  private async scanBackend(): Promise<CleanupSummary> {
    const { data } = await backendManager.apiRequest<BackendScanResponse>({
      method: "GET",
      url: "storage/gc/scan",
    });
    return {
      filesCount: data.files.count,
      filesSize: data.files.size,
    };
  }

  private async deleteBackend(): Promise<number> {
    const { data } = await backendManager.apiRequest<BackendDeleteResponse>({
      method: "POST",
      url: "storage/gc/delete",
    });
    return data.bytesFreed;
  }

  private async scanLocal(): Promise<CleanupSummary> {
    const orphans = await this.findLocalOrphans();
    return {
      filesCount: orphans.length,
      filesSize: orphans.reduce((sum, item) => sum + (item.file?.size || 0), 0),
    };
  }

  private async deleteLocal(): Promise<number> {
    const orphans = await this.findLocalOrphans();
    let bytesFreed = 0;

    for (const item of orphans) {
      try {
        await filesStorage.removeItem(item.id);
        bytesFreed += item.file?.size || 0;
      } catch (error) {
        console.error(`Failed to delete orphan file ${item.id}:`, error);
      }
    }

    return bytesFreed;
  }

  private async findLocalOrphans() {
    const refFiles = await this.collectReferencedIdsLocal();
    const now = Date.now();

    const fileItems = await filesStorage.getItems();

    return fileItems.filter(item =>
      !refFiles.has(item.id) && this.isOlderThanGrace(item.createdAt, now));
  }

  private isOlderThanGrace(createdAt: Date | string, now: number) {
    const ts = createdAt instanceof Date ? createdAt.getTime() : new Date(createdAt).getTime();
    if (!Number.isFinite(ts)) return false;
    return now - ts > GRACE_MS;
  }

  private async collectReferencedIdsLocal() {
    const files = new Set<string>();

    const [flows, characters, chats] = await Promise.all([
      flowsStorage.getItems(),
      charactersStorage.getItems(),
      chatsStorage.getItems(),
    ]);

    flows.forEach(flow => flow.mediaFiles?.forEach(file => files.add(file.id)));
    characters.forEach(character => {
      if (character.imageId) files.add(character.imageId);
      character.mediaFiles?.forEach(file => files.add(file.id));
    });

    chats.forEach(chat => {
      chat.mediaFiles?.forEach(file => files.add(file.id));
      chat.characters?.forEach(({ character }) => {
        if (character?.imageId) files.add(character.imageId);
        character?.mediaFiles?.forEach(file => files.add(file.id));
      });
      chat.flow?.mediaFiles?.forEach(file => files.add(file.id));
    });

    return files;
  }
}

export const storageCleanupController = new StorageCleanupController();
