import { Folder, MessageCircle, Users, Settings, GitBranch, Book, BotMessageSquare } from "lucide-react";

export const menu = [
  [BotMessageSquare, "Assistant", "/assistant"],
  [MessageCircle, "Chats", "/chats"],
  [Users, "Characters", "/characters"],
  [Book, "Lorebooks", "/lorebooks"],
  [Folder, "Prompts", "/prompts"],
  [GitBranch, 'Flows', '/flows'],
  [Settings, "Settings", "/settings"],
] as const;