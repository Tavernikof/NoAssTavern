import { Folder, MessageCircle, Users, Settings, GitBranch, Book } from "lucide-react";

export const menu = [
  [MessageCircle, "Chats", "/chats"],
  [Users, "Characters", "/characters"],
  [Book, "Lorebooks", "/lorebooks"],
  [Folder, "Prompts", "/prompts"],
  [GitBranch, 'Flows', '/flows'],
  [Settings, "Settings", "/settings"],
] as const;