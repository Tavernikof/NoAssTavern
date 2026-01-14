import { Folder, MessageCircle, Users, Settings, BotMessageSquare } from "lucide-react";

export const menu = [
  [BotMessageSquare, "Assistant", "/assistant"],
  [MessageCircle, "Chats", "/chats"],
  [Users, "Characters", "/characters"],
  [Folder, "Prompts", "/prompts"],
  [Settings, "Settings", "/settings"],
] as const;