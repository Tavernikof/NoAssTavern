import * as React from "react";
import { ChatController } from "src/routes/SingleChat/helpers/ChatController.ts";

export const useChatController = (chatId: string | undefined): ChatController | undefined => {
  const [store, setStore] = React.useState<ChatController>();
  React.useEffect(() => {
    if (!chatId) return;
    const store = new ChatController(chatId);
    setStore(store);

    return () => {
      store.dispose();
      setStore(undefined);
    };
  }, [chatId]);

  return store;
};
