import path from "path";
import fs from "fs";
import { STORAGE_DIR } from "../../../env.js";
import { StorageService } from "../storage.service.js";
import sharp from "sharp";
import glob from "fast-glob";
import { Entry, BlobWriter } from "@zip.js/zip.js";

export class ImagesStorage {
  readonly imagesDir: string;
  slug = "images";

  constructor(readonly storageService: StorageService) {
    this.imagesDir = path.join(STORAGE_DIR, this.slug);
    fs.mkdirSync(this.imagesDir, { recursive: true });
  }

  async parseBlob(blob: Blob) {
    const ab = await blob.arrayBuffer();
    return Buffer.from(ab);
  }

  async create(name: string, buffer: Buffer): Promise<void> {
    // const format = await this.getImageFormat(buffer);
    const filePath = path.join(this.imagesDir, name + ".jpg");

    const compressed = sharp(buffer)
      .jpeg({ quality: 80 });

    await compressed.toFile(filePath);
  }

  async clone(existId: string, newId: string) {
    const existFilePath = await this.getFilePath(existId);
    if (!existFilePath) return;
    const ext = path.parse(existFilePath).ext;
    await fs.promises.copyFile(
      existFilePath,
      path.resolve(this.imagesDir, newId + ext),
    );
    return true;
  }

  async getImageFormat(buffer: Buffer) {
    const metadata = await sharp(buffer).metadata();
    return metadata.format;
  }

  async removeFile(id: string): Promise<boolean> {
    const filePath = await this.getFilePath(id);
    if (!filePath) return false;
    await fs.promises.unlink(filePath);
    return true;
  }

  private async getFilePath(id: string) {
    const matches = await glob(`${id}.*`, { cwd: this.imagesDir, absolute: true });

    if (matches.length === 0) return null;
    return matches[0];
  }

  async importEntry(entry: Entry) {
    const regExp = new RegExp(`${this.slug}/([a-zA-Z0-9\\-]+)\\.([a-zA-Z0-9]+)`, "");
    const match = entry.filename.match(regExp);
    if (!match || !entry.getData) return false;
    const blobWriter = new BlobWriter("image/jpeg");
    const data = await entry.getData(blobWriter);
    if (!data) return false;
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await this.create(match[1], buffer);
    return true;
  }
}
