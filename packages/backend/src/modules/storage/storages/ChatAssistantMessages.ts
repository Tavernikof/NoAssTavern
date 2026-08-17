import path from "path";
import { Entry, TextWriter } from "@zip.js/zip.js";
import { z } from "zod";
import { STORAGE_DIR } from "../../../env.js";
import { AbstractStorage } from "../utils/AbstractStorage.js";
import { sortByCreatedAt } from "../utils/sortByCreatedAt.js";
import { ChatSwipeSchema } from "./Messages.js";

export const ChatAssistantMessageSchema = z.object({
  id: z.uuid(),
  chatId: z.uuid(),
  assistantChatId: z.uuid(),
  createdAt: z.iso.datetime(),
  role: z.string(),
  activeSwipe: z.number(),
  swipes: z.array(ChatSwipeSchema),
});

export type ChatAssistantMessage = z.infer<typeof ChatAssistantMessageSchema>;

export class ChatAssistantMessagesStorage extends AbstractStorage<ChatAssistantMessage> {
  private readonly baseChatsDir = path.resolve(STORAGE_DIR, "chats");

  constructor() {
    super("chatAssistantMessages", ChatAssistantMessageSchema);
  }

  async createForChat(data: ChatAssistantMessage) {
    this.updateDir(data.chatId, data.assistantChatId);
    return super.create(data.id, data);
  }

  async getForChat(chatId: string, assistantChatId: string, messageId: string) {
    this.updateDir(chatId, assistantChatId);
    return super.get(messageId);
  }

  async deleteForChat(chatId: string, assistantChatId: string, messageId: string) {
    this.updateDir(chatId, assistantChatId);
    return super.delete(messageId);
  }

  async listForChat(chatId: string, assistantChatId: string) {
    this.updateDir(chatId, assistantChatId);
    return super.list().then(list => sortByCreatedAt(list, true));
  }

  async importEntry(entry: Entry) {
    const match = entry.filename.match(
      /chats\/([a-zA-Z0-9-]+)\/assistantChats\/([a-zA-Z0-9-]+)\/messages\/([a-zA-Z0-9-]+)\.[a-zA-Z0-9]+/,
    );
    if (!match || !entry.getData) return false;
    const raw = await entry.getData(new TextWriter());
    const data = ChatAssistantMessageSchema.parse(JSON.parse(raw));
    await this.createForChat(data);
    return true;
  }

  private updateDir(chatId: string, assistantChatId: string) {
    this.setDirPath(path.resolve(
      this.baseChatsDir,
      chatId,
      "assistantChats",
      assistantChatId,
      "messages",
    ));
  }
}
