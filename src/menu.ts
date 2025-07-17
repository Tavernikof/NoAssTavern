import { Folder, MessageCircle, Users, VenetianMask, Settings, GitBranch } from "lucide-react";

export const menu = [
  [MessageCircle, "Chats", "/chats"],
  [Users, "Characters", "/characters"],
  [VenetianMask, "Personas", "/personas"],
  [Folder, "Prompts", "/prompts"],
  [GitBranch, 'Flows', '/flows'],
  [Settings, "Settings", "/settings"],
] as const;