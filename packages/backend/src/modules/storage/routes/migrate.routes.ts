import { FastifyInstance } from "fastify";
import { StorageService } from "../storage.service.js";
import { BlobReader, BlobWriter, ZipReader, ZipWriter } from "@zip.js/zip.js";
import fs from "fs";
import path from "path";
import { STORAGE_DIR } from "../../../env.js";

export const migrateRoutes = (storages: StorageService) => async (app: FastifyInstance) => {
  app.post("/", async (req) => {
    const parts = req.parts();

    for await (const part of parts) {
      if (part.type === "file" && part.file) {
        const buffer = await part.toBuffer();
        const arrayBuffer = new Uint8Array(buffer);
        const reader = new ZipReader(new BlobReader(new Blob([arrayBuffer])));

        const entries = await reader.getEntries();
        for (const entry of entries) {
          if (entry.directory) continue;

          for (const storage of storages.list) {
            if (await storage.importEntry(entry)) break;
          }
        }

        await reader.close();
      }
    }
  });

  app.get("/", {}, async (req, res) => {
    const listFiles = async (dir: string): Promise<string[]> => {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      const files = [];
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isFile()) {
          files.push(fullPath);
        } else if (entry.isDirectory()) {
          const childFiles = await listFiles(fullPath);
          files.push(...childFiles);
        }
      }
      return files;
    };

    const files = await listFiles(STORAGE_DIR);

    const blobWriter = new BlobWriter("application/zip");
    const zipWriter = new ZipWriter(blobWriter);

    for (const filePath of files) {
      const relPath = path.relative(STORAGE_DIR, filePath);
      const data = await fs.promises.readFile(filePath);
      await zipWriter.add(relPath, new BlobReader(new Blob([new Uint8Array(data)])));
    }

    await zipWriter.close();
    const zipBlob = await blobWriter.getData();
    const zipBuffer = Buffer.from(await zipBlob.arrayBuffer());

    res
      .header("Content-Type", "application/zip")
      .header("Content-Disposition", "attachment; filename=\"archive.zip\"");

    return zipBuffer;
  });
};