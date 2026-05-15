import fs from "fs";
import path from "path";
import { StorageService } from "./storage.service.js";
import { Message } from "./storages/Messages.js";
import { AssistantMessage } from "./storages/AssistantMessages.js";

export type OrphanInfo = {
  id: string;
  name: string;
  size: number;
  mtime: number;
  fullPath: string;
};

export type GcSummary = {
  files: { count: number; size: number };
  images: { count: number; size: number };
};

export type GcDeleteResult = {
  filesDeleted: number;
  imagesDeleted: number;
  bytesFreed: number;
};

const GRACE_MS = 24 * 60 * 60 * 1000;

function collectImageIdsFromSwipes(
  messages: (Message | AssistantMessage)[],
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

export class GarbageCollectorService {
  constructor(private storage: StorageService) {}

  async collectReferenced(): Promise<{ files: Set<string>; images: Set<string> }> {
    const files = new Set<string>();
    const images = new Set<string>();

    const flows = await this.storage.flows.list();
    flows.forEach(flow => flow.mediaFiles?.forEach(file => files.add(file.id)));

    const characters = await this.storage.characters.list();
    characters.forEach(character => {
      if (character.imageId) images.add(character.imageId);
    });

    const chats = await this.storage.chats.list();
    for (const chat of chats) {
      chat.characters.forEach(({ character }) => {
        if (character.imageId) images.add(character.imageId);
      });
      chat.flow?.mediaFiles?.forEach(file => files.add(file.id));

      const messages = await this.storage.messages.listForChat(chat.id);
      collectImageIdsFromSwipes(messages, images);
    }
    this.storage.messages.resetDir();

    const assistantChats = await this.storage.assistantChats.list();
    for (const aChat of assistantChats) {
      const messages = await this.storage.assistantMessages.listForChat(aChat.id);
      collectImageIdsFromSwipes(messages, images);
    }
    this.storage.assistantMessages.resetDir();

    return { files, images };
  }

  async scan(): Promise<{ files: OrphanInfo[]; images: OrphanInfo[] }> {
    const { files: refFiles, images: refImages } = await this.collectReferenced();
    const now = Date.now();

    const fileOrphans = await this.findOrphans(this.storage.files.filesDir, refFiles, now);
    const imageOrphans = await this.findOrphans(this.storage.images.imagesDir, refImages, now);

    return { files: fileOrphans, images: imageOrphans };
  }

  async scanSummary(): Promise<GcSummary> {
    const { files, images } = await this.scan();
    return {
      files: { count: files.length, size: files.reduce((sum, o) => sum + o.size, 0) },
      images: { count: images.length, size: images.reduce((sum, o) => sum + o.size, 0) },
    };
  }

  async deleteOrphans(): Promise<GcDeleteResult> {
    const { files, images } = await this.scan();
    let bytesFreed = 0;
    let filesDeleted = 0;
    let imagesDeleted = 0;

    for (const orphan of files) {
      try {
        await fs.promises.unlink(orphan.fullPath);
        bytesFreed += orphan.size;
        filesDeleted++;
      } catch (error) {
        console.error(`Failed to delete orphan file ${orphan.fullPath}:`, error);
      }
    }

    for (const orphan of images) {
      try {
        await fs.promises.unlink(orphan.fullPath);
        bytesFreed += orphan.size;
        imagesDeleted++;
      } catch (error) {
        console.error(`Failed to delete orphan image ${orphan.fullPath}:`, error);
      }
    }

    return { filesDeleted, imagesDeleted, bytesFreed };
  }

  private async findOrphans(
    dir: string,
    referenced: Set<string>,
    now: number,
  ): Promise<OrphanInfo[]> {
    let entries: fs.Dirent[];
    try {
      entries = await fs.promises.readdir(dir, { withFileTypes: true });
    } catch {
      return [];
    }

    const result: OrphanInfo[] = [];
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const id = path.parse(entry.name).name;
      if (referenced.has(id)) continue;

      const fullPath = path.join(dir, entry.name);
      let stat: fs.Stats;
      try {
        stat = await fs.promises.stat(fullPath);
      } catch {
        continue;
      }
      if (now - stat.mtimeMs < GRACE_MS) continue;

      result.push({
        id,
        name: entry.name,
        size: stat.size,
        mtime: stat.mtimeMs,
        fullPath,
      });
    }
    return result;
  }
}
