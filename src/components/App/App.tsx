import * as React from "react";
import { RouterProvider } from "react-router";
import { router } from "src/components/App/helpers/router.tsx";
import { autorun } from "mobx";
import { chatsManager } from "src/store/ChatsManager.ts";
import { charactersManager } from "src/store/CharactersManager.ts";
import { connectionProxiesManager } from "src/store/ConnectionProxiesManager.ts";
import { promptsManager } from "src/store/PromptsManager.ts";

type Props = Record<string, never>;

const App: React.FC<Props> = () => {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    return autorun(() => {
      const { characters } = charactersManager;
      const { chats } = chatsManager;
      const { proxies } = connectionProxiesManager;
      const { prompts } = promptsManager;
      if (chats && characters && proxies && prompts) setReady(true);
    });
  }, []);

  if (!ready) return null;
  return (
    <RouterProvider router={router} />
  );
};

export default React.memo(App) as typeof App;
