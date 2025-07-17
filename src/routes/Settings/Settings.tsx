import * as React from "react";
import Title from "src/components/Title";
import Subtitle from "src/components/App/components/Subtitle";
import PrivateInputForm from "src/routes/Settings/components/PrivateInputForm";
import { globalSettings } from "src/store/GlobalSettings.ts";
import { observer } from "mobx-react-lite";
import style from "./Settings.module.scss";
import Button from "src/components/Button";
import { PackagePlus } from "lucide-react";
import { openConnectionProxyModal } from "src/components/ConnectionProxyModal";
import { connectionProxiesManager } from "src/store/ConnectionProxiesManager.ts";
import { ConnectionProxy } from "src/store/ConnectionProxy.ts";
import ConnectionProxiesList from "src/routes/Settings/components/ConnectionProxiesList";

type Props = Record<string, never>;

const Settings: React.FC<Props> = () => {
  const { openaiKey, geminiKey, claudeKey, updateOpenaiKey, updateGeminiKey, updateClaudeKey } = globalSettings;
  return (
    <>
      <Title>Settings</Title>
      <div className={style.content}>
        <div className={style.block}>
          <Subtitle>Connection settings</Subtitle>
          <PrivateInputForm label="OpenAI key" value={openaiKey} onChange={updateOpenaiKey} />
          <PrivateInputForm label="Gemini key" value={geminiKey} onChange={updateGeminiKey} />
          <PrivateInputForm label="Claude key" value={claudeKey} onChange={updateClaudeKey} />
        </div>
        <div>
          <Subtitle>Proxies</Subtitle>
          <div className={style.actions}>
            <Button
              iconBefore={PackagePlus}
              onClick={() => {
                openConnectionProxyModal({ connectionProxy: ConnectionProxy.createEmpty() }).result.then(preset => {
                  connectionProxiesManager.add(preset);
                });
              }}
            >
              Create
            </Button>
          </div>
          <ConnectionProxiesList />
        </div>
      </div>
    </>
  );
};

export default observer(Settings) as typeof Settings;
