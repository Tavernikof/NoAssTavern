import * as React from "react";
import { MessageController } from "./MessageController.ts";

export type ChatMessageContextType = {
  chatMessage: MessageController
}

export const ChatMessageContext = React.createContext<ChatMessageContextType | null>(null);

export const useChatMessageContext = (): ChatMessageContextType => {
  const context = React.useContext(ChatMessageContext);
  if (!context) throw new Error("useChatMessageContext must be used within ChatMessageContext");
  return context;
};
