import fs from "fs";
import path from "path";
import { STORAGE_DIR } from "../../../env.js";

const IMAGES_DIR = path.join(STORAGE_DIR, "images");
const FILES_DIR = path.join(STORAGE_DIR, "files");

async function moveFile(from: string, to: string) {
  try {
    await fs.promises.rename(from, to);
  } catch (err: any) {
    if (err?.code === "EXDEV") {
      await fs.promises.copyFile(from, to);
      await fs.promises.unlink(from);
    } else {
      throw err;
    }
  }
}

async function moveImageFiles(): Promise<number> {
  await fs.promises.mkdir(FILES_DIR, { recursive: true });
  const entries = await fs.promises.readdir(IMAGES_DIR, { withFileTypes: true });
  let moved = 0;
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const from = path.join(IMAGES_DIR, entry.name);
    const to = path.join(FILES_DIR, entry.name);
    try {
      await fs.promises.access(to);
      continue;
    } catch {}
    await moveFile(from, to);
    moved++;
  }
  return moved;
}

async function listMessageJsonFiles(rootDir: string, messagesDirName: string): Promise<string[]> {
  let chatDirs: fs.Dirent[];
  try {
    chatDirs = await fs.promises.readdir(rootDir, { withFileTypes: true });
  } catch {
    return [];
  }
  const out: string[] = [];
  for (const chat of chatDirs) {
    if (!chat.isDirectory()) continue;
    const dir = path.join(rootDir, chat.name, messagesDirName);
    let files: fs.Dirent[];
    try {
      files = await fs.promises.readdir(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const f of files) {
      if (f.isFile() && f.name.endsWith(".json")) out.push(path.join(dir, f.name));
    }
  }
  return out;
}

async function scrubMessagesAt(rootDir: string, messagesDirName: string): Promise<number> {
  const paths = await listMessageJsonFiles(rootDir, messagesDirName);
  let scrubbed = 0;
  for (const filePath of paths) {
    const raw = await fs.promises.readFile(filePath, "utf-8");
    let message: any;
    try {
      message = JSON.parse(raw);
    } catch {
      continue;
    }
    let mutated = false;
    if (Array.isArray(message?.swipes)) {
      for (const swipe of message.swipes) {
        const prompts = swipe?.prompts;
        if (!prompts || typeof prompts !== "object") continue;
        for (const key of Object.keys(prompts)) {
          const prompt = prompts[key];
          if (prompt && "images" in prompt) {
            delete prompt.images;
            mutated = true;
          }
        }
      }
    }
    if (mutated) {
      await fs.promises.writeFile(filePath, JSON.stringify(message, null, 2));
      scrubbed++;
    }
  }
  return scrubbed;
}

export async function runImagesToFilesMigration(): Promise<void> {
  if (!fs.existsSync(IMAGES_DIR)) return;
  try {
    const moved = await moveImageFiles();
    const chatsScrubbed = await scrubMessagesAt(path.join(STORAGE_DIR, "chats"), "messages");
    const assistantScrubbed = await scrubMessagesAt(
      path.join(STORAGE_DIR, "assistantChats"),
      "assistantMessages",
    );
    await fs.promises.rm(IMAGES_DIR, { recursive: true, force: true });
    console.log(
      `[migration:imagesToFiles] moved ${moved} files, scrubbed ${chatsScrubbed + assistantScrubbed} messages`,
    );
  } catch (error) {
    console.error("[migration:imagesToFiles] failed:", error);
  }
}
