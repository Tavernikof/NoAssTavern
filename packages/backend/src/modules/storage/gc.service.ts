import fs from "fs";
import path from "path";
import { StorageService } from "./storage.service.js";
import { MediaFile } from "./storages/MediaFile.js";

export type OrphanInfo = {
  id: string;
  name: string;
  size: number;
  mtime: number;
  fullPath: string;
};

export type GcSummary = {
  files: { count: number; size: number };
  list: OrphanInfo[]
};

export type GcDeleteResult = {
  filesDeleted: number;
  bytesFreed: number;
};

const GRACE_MS = 24 * 60 * 60 * 1000;

function addMediaFileIds(list: MediaFile[] | undefined, out: Set<string>) {
  if (!list) return;
  for (const file of list) {
    if (file?.id) out.add(file.id);
  }
}

export class GarbageCollectorService {
  constructor(private storage: StorageService) {}

  async collectReferenced(): Promise<{ files: Set<string> }> {
    const files = new Set<string>();

    const flows = await this.storage.flows.list();
    flows.forEach(flow => {
      addMediaFileIds(flow.mediaFiles, files);
      flow.prompts?.forEach(prompt => addMediaFileIds(prompt.mediaFiles, files));
    });

    const characters = await this.storage.characters.list();
    characters.forEach(character => {
      if (character.imageId) files.add(character.imageId);
      addMediaFileIds(character.mediaFiles, files);
    });

    const prompts = await this.storage.prompts.list();
    prompts.forEach(prompt => addMediaFileIds(prompt.mediaFiles, files));

    const chats = await this.storage.chats.list();
    for (const chat of chats) {
      addMediaFileIds(chat.mediaFiles, files);
      chat.characters.forEach(({ character }) => {
        if (character.imageId) files.add(character.imageId);
        addMediaFileIds(character.mediaFiles, files);
      });
      addMediaFileIds(chat.flow?.mediaFiles, files);
      chat.flow?.prompts?.forEach(prompt => addMediaFileIds(prompt.mediaFiles, files));
    }

    return { files };
  }

  async scan(): Promise<{ files: OrphanInfo[] }> {
    const { files: refFiles } = await this.collectReferenced();
    const now = Date.now();

    const fileOrphans = await this.findOrphans(this.storage.files.filesDir, refFiles, now);

    return { files: fileOrphans };
  }

  async scanSummary(): Promise<GcSummary> {
    const { files } = await this.scan();
    return {
      files: { count: files.length, size: files.reduce((sum, o) => sum + o.size, 0) },
      list: files,
    };
  }

  async deleteOrphans(): Promise<GcDeleteResult> {
    const { files } = await this.scan();
    let bytesFreed = 0;
    let filesDeleted = 0;

    for (const orphan of files) {
      try {
        await fs.promises.unlink(orphan.fullPath);
        bytesFreed += orphan.size;
        filesDeleted++;
      } catch (error) {
        console.error(`Failed to delete orphan file ${orphan.fullPath}:`, error);
      }
    }

    return { filesDeleted, bytesFreed };
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
