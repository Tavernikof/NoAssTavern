import fs from "fs/promises";
import { z } from "zod";
import path from "path";
import { AbstractStorage } from "../utils/AbstractStorage.js";
import { STORAGE_DIR } from "../../../env.js";
import { sortByCreatedAt } from "../utils/sortByCreatedAt.js";
import { StorageService } from "../storage.service.js";

export const ChatSwipePromptImageSchema = z.object({
  imageId: z.string(),
});

export const ChatSwipePromptResultSchema = z.object({
  requestId: z.string().nullish(),
  message: z.string(),
  images: z.array(ChatSwipePromptImageSchema).optional(),
  error: z.string().nullish(),
});

export const ChatSwipeSchema = z.object({
  createdAt: z.string(),
  prompts: z.object().catchall(ChatSwipePromptResultSchema),
});

export const MessageSchema = z.object({
  id: z.uuid(),
  chatId: z.string(),
  createdAt: z.iso.datetime(),
  role: z.string(), // todo: add enum
  activeSwipe: z.number(),
  swipes: z.array(ChatSwipeSchema),
});

export type Message = z.infer<typeof MessageSchema>;

export class MessagesStorage extends AbstractStorage<Message> {
  baseChatsDir = path.resolve(STORAGE_DIR, "chats");

  constructor(readonly storageService: StorageService) {
    super("messages", MessageSchema);
  }

  async create(id: string, data: Message): Promise<Message> {
    this.updateDir(data.chatId);
    return super.create(id, data);
  }

  async get(id: string): Promise<Message | null> {
    const chatId = await this.findChatByMessageId(id);
    if (!chatId) return null;
    this.updateDir(chatId);
    return super.get(id);
  }

  async delete(id: string): Promise<boolean> {
    const message = await this.get(id);
    if (!message) return false;
    this.updateDir(message.chatId);
    return super.delete(id);
  }

  listForChat(chatId: string): Promise<Message[]> {
    this.updateDir(chatId);
    return this.list().then(list => sortByCreatedAt(list, true));
  }

  resetDir() {
    this.setDirPath(this.baseChatsDir);
  }

  private updateDir(chatId: string): void {
    this.setDirPath(path.resolve(this.baseChatsDir, chatId, "messages"));
  }

  private async findChatByMessageId(messageId: string) {
    const chatDirs = await fs.readdir(this.baseChatsDir, { withFileTypes: true });

    try {
      for (const dirent of chatDirs) {
        if (dirent.isDirectory()) {
          const chatPath = path.join(this.baseChatsDir, dirent.name, "messages");
          const files = await fs.readdir(chatPath, { withFileTypes: true });
          for (const file of files) {
            if (file.isFile() && file.name === `${messageId}.json`) {
              return dirent.name;
            }
          }
        }
      }
    } catch (error) {
    }

    return null;
  }
}