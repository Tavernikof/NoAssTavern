import { openDB, deleteDB } from "idb";
import { globalSettings } from "src/store/GlobalSettings.ts";
import { filesStorage } from "src/storages/FilesStorage.ts";

const IMAGES_DB = "images";

type LegacyImage = { id: string; createdAt: Date | string; image: Blob };

async function legacyImagesDbExists(): Promise<boolean> {
  if (typeof indexedDB === "undefined" || typeof indexedDB.databases !== "function") return false;
  const dbs = await indexedDB.databases();
  return dbs.some(db => db.name === IMAGES_DB);
}

async function moveBlobsToFiles(): Promise<void> {
  const db = await openDB(IMAGES_DB);
  if (!db.objectStoreNames.contains(IMAGES_DB)) {
    db.close();
    return;
  }
  const items: LegacyImage[] = await db.getAll(IMAGES_DB);
  db.close();

  for (const item of items) {
    if (!item?.id || !(item.image instanceof Blob)) continue;
    const createdAt = item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt);
    await filesStorage.updateItem({
      id: item.id,
      createdAt,
      file: item.image,
      name: `${item.id}.jpg`,
      mimeType: item.image.type || "image/jpeg",
    });
  }
}

async function stripImagesInDb(dbName: string): Promise<void> {
  let db;
  try {
    db = await openDB(dbName);
  } catch {
    return;
  }
  if (!db.objectStoreNames.contains(dbName)) {
    db.close();
    return;
  }
  const tx = db.transaction(dbName, "readwrite");
  let cursor = await tx.objectStore(dbName).openCursor();
  while (cursor) {
    const value = cursor.value;
    let mutated = false;
    for (const swipe of value?.swipes ?? []) {
      const prompts = swipe?.prompts;
      if (!prompts) continue;
      for (const key of Object.keys(prompts)) {
        const prompt = prompts[key];
        if (prompt && "images" in prompt) {
          delete prompt.images;
          mutated = true;
        }
      }
    }
    if (mutated) await cursor.update(value);
    cursor = await cursor.continue();
  }
  await tx.done;
  db.close();
}

export async function runImagesToFilesMigration(): Promise<void> {
  if (!(await legacyImagesDbExists())) return;
  try {
    if (globalSettings.isBackendEnabled) {
      await deleteDB(IMAGES_DB);
      return;
    }
    await moveBlobsToFiles();
    await stripImagesInDb("messages");
    await stripImagesInDb("assistantMessages");
    await deleteDB(IMAGES_DB);
  } catch (error) {
    console.error("[migration:imagesToFiles] failed:", error);
  }
}
