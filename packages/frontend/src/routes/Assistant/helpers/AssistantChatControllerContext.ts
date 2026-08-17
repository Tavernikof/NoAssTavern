import * as React from "react";
import { AssistantChatController } from "src/routes/Assistant/helpers/AssistantChatController.ts";

export type AssistantChatControllerContextType = AssistantChatController;

export const AssistantChatControllerContext = React.createContext<AssistantChatControllerContextType | null>(null);

export const useAssistantChatController = (
  assistantChatId: string | undefined,
  parentChatController?: import("src/routes/SingleChat/helpers/ChatController.ts").ChatController,
): AssistantChatController | undefined => {
  const [controller] = React.useState(() => new AssistantChatController({ parentChatController }));

  React.useEffect(() => {
    controller.setup();
    return () => controller.dispose();
  }, [controller]);

  React.useEffect(() => {
    controller.setChatId(assistantChatId);
  }, [assistantChatId, controller]);

  return controller;
};

export const useAssistantChatControllerContext = (): AssistantChatControllerContextType => {
  const context = React.useContext(AssistantChatControllerContext);
  if (!context) throw new Error("useAssistantChatControllerContext must be used within ChatControllerContext");
  return context;
};
