import * as React from "react";
import { RouterProvider } from "react-router";
import { router } from "src/components/App/helpers/router.tsx";
import { autorun } from "mobx";
import { chatsManager } from "src/store/ChatsManager.ts";
import { charactersManager } from "src/store/CharactersManager.ts";
import { connectionProxiesManager } from "src/store/ConnectionProxiesManager.ts";
import { promptsManager } from "src/store/PromptsManager.ts";
import { flowsManager } from "src/store/FlowsManager.ts";
import { loreBookManager } from "src/store/LoreBookManager.ts";

type Props = Record<string, never>;

const App: React.FC<Props> = () => {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    return autorun(() => {
      if (
        charactersManager.ready &&
        chatsManager.ready &&
        connectionProxiesManager.ready &&
        flowsManager.ready &&
        loreBookManager.ready &&
        promptsManager.ready
      ) setReady(true);
    });
  }, []);

  if (!ready) return null;
  return (
    <RouterProvider router={router} />
  );
};

export default React.memo(App) as typeof App;
