import * as React from "react";
import { ChatController } from "src/routes/SingleChat/helpers/ChatController.ts";

export type ChatControllerContextType = ChatController;

export const ChatControllerContext = React.createContext<ChatControllerContextType | null>(null);

export const useChatControllerContext = (): ChatControllerContextType => {
  const context = React.useContext(ChatControllerContext);
  if (!context) throw new Error("useChatControllerContext must be used within ChatControllerContext");
  return context;
};
