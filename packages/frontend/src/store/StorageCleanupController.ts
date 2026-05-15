import { action, makeObservable, observable, runInAction } from "mobx";
import { globalSettings } from "src/store/GlobalSettings.ts";
import { backendManager } from "src/store/BackendManager.ts";
import { filesStorage } from "src/storages/FilesStorage.ts";
import { imagesStorage } from "src/storages/ImagesStorage.ts";
import { flowsStorage } from "src/storages/FlowsStorage.ts";
import { charactersStorage } from "src/storages/CharactersStorage.ts";
import { chatsStorage } from "src/storages/ChatsStorage.ts";
import { messageStorage } from "src/storages/MessageStorage.ts";
import { assistantMessageStorage } from "src/storages/AssistantMessageStorage.ts";

const GRACE_MS = 24 * 60 * 60 * 1000;

export type CleanupStatus = "idle" | "scanning" | "scanned" | "deleting" | "done" | "error";

export type CleanupSummary = {
  filesCount: number;
  filesSize: number;
  imagesCount: number;
  imagesSize: number;
};

type BackendScanResponse = {
  files: { count: number; size: number };
  images: { count: number; size: number };
};

type BackendDeleteResponse = {
  filesDeleted: number;
  imagesDeleted: number;
  bytesFreed: number;
};

type SwipeLike = {
  prompts: Record<string, { images?: { imageId: string }[] } | null | undefined>;
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
      imagesCount: data.images.count,
      imagesSize: data.images.size,
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
      filesCount: orphans.files.length,
      filesSize: orphans.files.reduce((sum, item) => sum + (item.file?.size || 0), 0),
      imagesCount: orphans.images.length,
      imagesSize: orphans.images.reduce((sum, item) => sum + (item.image?.size || 0), 0),
    };
  }

  private async deleteLocal(): Promise<number> {
    const orphans = await this.findLocalOrphans();
    let bytesFreed = 0;

    for (const item of orphans.files) {
      try {
        await filesStorage.removeItem(item.id);
        bytesFreed += item.file?.size || 0;
      } catch (error) {
        console.error(`Failed to delete orphan file ${item.id}:`, error);
      }
    }

    for (const item of orphans.images) {
      try {
        await imagesStorage.removeItem(item.id);
        bytesFreed += item.image?.size || 0;
      } catch (error) {
        console.error(`Failed to delete orphan image ${item.id}:`, error);
      }
    }

    return bytesFreed;
  }

  private async findLocalOrphans() {
    const { files: refFiles, images: refImages } = await this.collectReferencedIdsLocal();
    const now = Date.now();

    const [fileItems, imageItems] = await Promise.all([
      filesStorage.getItems(),
      imagesStorage.getItems(),
    ]);

    const fileOrphans = fileItems.filter(item =>
      !refFiles.has(item.id) && this.isOlderThanGrace(item.createdAt, now));
    const imageOrphans = imageItems.filter(item =>
      !refImages.has(item.id) && this.isOlderThanGrace(item.createdAt, now));

    return { files: fileOrphans, images: imageOrphans };
  }

  private isOlderThanGrace(createdAt: Date | string, now: number) {
    const ts = createdAt instanceof Date ? createdAt.getTime() : new Date(createdAt).getTime();
    if (!Number.isFinite(ts)) return false;
    return now - ts > GRACE_MS;
  }

  private async collectReferencedIdsLocal() {
    const files = new Set<string>();
    const images = new Set<string>();

    const [flows, characters, chats, messages, assistantMessages] = await Promise.all([
      flowsStorage.getItems(),
      charactersStorage.getItems(),
      chatsStorage.getItems(),
      messageStorage.getItems(),
      assistantMessageStorage.getItems(),
    ]);

    flows.forEach(flow => flow.mediaFiles?.forEach(file => files.add(file.id)));
    characters.forEach(character => {
      if (character.imageId) images.add(character.imageId);
    });

    chats.forEach(chat => {
      chat.characters?.forEach(({ character }) => {
        if (character?.imageId) images.add(character.imageId);
      });
      chat.flow?.mediaFiles?.forEach(file => files.add(file.id));
    });

    collectImageIdsFromSwipes(messages, images);
    collectImageIdsFromSwipes(assistantMessages, images);

    return { files, images };
  }
}

function collectImageIdsFromSwipes(
  messages: { swipes: SwipeLike[] }[],
  out: Set<string>,
) {
  for (const message of messages) {
    for (const swipe of message.swipes) {
      for (const promptKey in swipe.prompts) {
        const prompt = swipe.prompts[promptKey];
        if (!prompt?.images) continue;
        for (const image of prompt.images) {
          if (image?.imageId) out.add(image.imageId);
        }
      }
    }
  }
}

export const storageCleanupController = new StorageCleanupController();
