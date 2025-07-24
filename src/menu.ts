import { Folder, MessageCircle, Users, Settings, GitBranch } from "lucide-react";

export const menu = [
  [MessageCircle, "Chats", "/chats"],
  [Users, "Characters", "/characters"],
  [Folder, "Prompts", "/prompts"],
  [GitBranch, 'Flows', '/flows'],
  [Settings, "Settings", "/settings"],
] as const;