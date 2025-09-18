import fs from "fs";
import path from "path";
import { z } from "zod";
import { STORAGE_DIR } from "../../../env.js";
import { sortByCreatedAt } from "./sortByCreatedAt.js";
import { Entry, TextWriter } from "@zip.js/zip.js";

export class AbstractStorage<T extends { id: string, createdAt: string }> {
  private schema: z.ZodType<T>;
  slug: string = "";
  protected dirPath: string = "";

  constructor(dirPath: string, schema: z.ZodType<T>) {
    this.schema = schema;
    this.slug = dirPath;
    this.setDirPath(dirPath);
  }

  protected filePath(id: string) {
    return path.join(this.dirPath, `${id}.json`);
  }

  setDirPath(dirPath: string) {
    this.dirPath = path.resolve(STORAGE_DIR, dirPath);
    if (dirPath && !fs.existsSync(this.dirPath)) {
      fs.mkdirSync(this.dirPath, { recursive: true });
    }
  }

  async parseBlob(blob: Blob) {
    const text = await blob.text();
    return this.schema.parse(JSON.parse(text));
  }

  async create(id: string, data: T): Promise<T> {
    await fs.promises.writeFile(this.filePath(id), JSON.stringify(data, null, 2), "utf-8");
    return data;
  }

  async get(id: string): Promise<T | null> {
    const file = this.filePath(id);
    if (!fs.existsSync(file)) return null;
    const raw = await fs.promises.readFile(file, "utf-8");
    const parsedJson = JSON.parse(raw);
    return parsedJson;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const obj = await this.get(id);
    if (!obj) throw new Error(`Not found: ${id}`);
    const updated = { ...obj, ...data };
    const parsed = this.schema.parse(updated);
    await fs.promises.writeFile(this.filePath(id), JSON.stringify(parsed, null, 2), "utf-8");
    return parsed;
  }

  async delete(id: string): Promise<boolean> {
    const file = this.filePath(id);
    if (fs.existsSync(file)) {
      await fs.promises.unlink(file);
      return true;
    }
    return false;
  }

  async list(): Promise<T[]> {
    const dirents = await fs.promises.readdir(this.dirPath, { withFileTypes: true });
    const items: T[] = [];
    for (const dirent of dirents) {
      if (dirent.isFile() && dirent.name.endsWith(".json")) {
        try {
          const raw = await fs.promises.readFile(path.join(this.dirPath, dirent.name), "utf-8");
          const parsedJson = JSON.parse(raw);
          items.push(parsedJson);
        } catch (error) {
          console.error(`Skipping invalid file ${dirent.name}:`, error);
        }
      }
    }
    return sortByCreatedAt(items);
  }

  async importEntry(entry: Entry) {
    const regExp = new RegExp(`${this.slug}/([a-zA-Z0-9\\-]+)\\.([a-zA-Z0-9]+)`, "");
    const match = entry.filename.match(regExp);
    if (!match || !entry.getData) return false;
    const textWriter = new TextWriter();
    const data = await entry.getData(textWriter);
    const entity = JSON.parse(data);
    if (!entity) return false;
    if (typeof entity.createdAt === "string") entity.createdAt = new Date(entity.createdAt);
    await this.create(entity.id, entity);
    return true;
  }
}