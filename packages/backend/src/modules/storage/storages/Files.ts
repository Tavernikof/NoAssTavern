import path from "path";
import fs from "fs";
import { STORAGE_DIR } from "../../../env.js";
import { StorageService } from "../storage.service.js";
import glob from "fast-glob";
import { Entry, BlobWriter } from "@zip.js/zip.js";

export class FilesStorage {
  readonly filesDir: string;
  slug = "files";

  constructor(readonly storageService: StorageService) {
    this.filesDir = path.join(STORAGE_DIR, this.slug);
    fs.mkdirSync(this.filesDir, { recursive: true });
  }

  async create(name: string, buffer: Buffer, ext: string): Promise<void> {
    const safeExt = (ext || "").replace(/^\./, "").replace(/[^a-zA-Z0-9]/g, "") || "bin";
    const filePath = path.join(this.filesDir, name + "." + safeExt);
    await fs.promises.writeFile(filePath, buffer);
  }

  async clone(existId: string, newId: string) {
    const existFilePath = await this.getFilePath(existId);
    if (!existFilePath) return;
    const ext = path.parse(existFilePath).ext;
    await fs.promises.copyFile(
      existFilePath,
      path.resolve(this.filesDir, newId + ext),
    );
    return true;
  }

  async removeFile(id: string): Promise<boolean> {
    const filePath = await this.getFilePath(id);
    if (!filePath) return false;
    await fs.promises.unlink(filePath);
    return true;
  }

  async getFilePath(id: string) {
    const matches = await glob(`${id}.*`, { cwd: this.filesDir, absolute: true });
    if (matches.length === 0) return null;
    return matches[0];
  }

  async importEntry(entry: Entry) {
    const regExp = new RegExp(`${this.slug}/([a-zA-Z0-9\\-]+)\\.([a-zA-Z0-9]+)`, "");
    const match = entry.filename.match(regExp);
    if (!match || !entry.getData) return false;
    const blobWriter = new BlobWriter();
    const data = await entry.getData(blobWriter);
    if (!data) return false;
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await this.create(match[1], buffer, match[2]);
    return true;
  }
}
