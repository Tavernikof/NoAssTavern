import fs from "fs/promises";
import { z } from "zod";
import path from "path";
import { AbstractStorage } from "../utils/AbstractStorage.js";
import { STORAGE_DIR } from "../../../env.js";
import { sortByCreatedAt } from "../utils/sortByCreatedAt.js";
import { StorageService } from "../storage.service.js";
import { ChatSwipeSchema } from "./Messages.js";

export const AssistantMessageSchema = z.object({
  id: z.uuid(),
  assistantChatId: z.string(),
  createdAt: z.iso.datetime(),
  role: z.string(), // todo: add enum
  activeSwipe: z.number(),
  swipes: z.array(ChatSwipeSchema),
});

export type AssistantMessage = z.infer<typeof AssistantMessageSchema>;

export class AssistantMessagesStorage extends AbstractStorage<AssistantMessage> {
  baseChatsDir = path.resolve(STORAGE_DIR, "assistantChats");

  constructor(readonly storageService: StorageService) {
    super("messages", AssistantMessageSchema);
  }

  async create(id: string, data: AssistantMessage): Promise<AssistantMessage> {
    this.updateDir(data.assistantChatId);
    return super.create(id, data);
  }

  async get(id: string): Promise<AssistantMessage | null> {
    const chatId = await this.findChatByMessageId(id);
    if (!chatId) return null;
    this.updateDir(chatId);
    return super.get(id);
  }

  async delete(id: string): Promise<boolean> {
      const message = await this.get(id);
      if (!message) return false;
      this.updateDir(message.assistantChatId);
      return super.delete(id);
  }

  listForChat(chatId: string): Promise<AssistantMessage[]> {
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