import * as React from "react";
import { ChatFormContextStore } from "./ChatFormContextStore.ts";

export type ChatFormContextType = ChatFormContextStore;

export const ChatFormContext = React.createContext<ChatFormContextType | null>(null);

export const useChatFormContext = (): ChatFormContextType => {
  const context = React.useContext(ChatFormContext);
  if (!context) throw new Error("useChatFormContext must be used within ChatFormContext");
  return context;
};
