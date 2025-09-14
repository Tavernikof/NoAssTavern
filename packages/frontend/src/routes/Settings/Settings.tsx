import * as React from "react";
import Title from "src/components/Title";
import Subtitle from "src/components/App/components/Subtitle";
import InputForm from "./components/InputForm";
import { globalSettings } from "src/store/GlobalSettings.ts";
import { observer } from "mobx-react-lite";
import style from "./Settings.module.scss";
import Button from "src/components/Button";
import { PackagePlus } from "lucide-react";
import { openConnectionProxyModal } from "src/components/ConnectionProxyModal";
import { connectionProxiesManager } from "src/store/ConnectionProxiesManager.ts";
import { ConnectionProxy } from "src/store/ConnectionProxy.ts";
import ConnectionProxiesList from "src/routes/Settings/components/ConnectionProxiesList";
import BackendSettings from "src/routes/Settings/components/BackendSettings";
import { Checkbox } from "src/components/Form";

type Props = Record<string, never>;

const Settings: React.FC<Props> = () => {
  const {
    openaiKey,
    geminiKey,
    claudeKey,
    proxyRequestsThroughBackend,
    socks5,
    updateOpenaiKey,
    updateGeminiKey,
    updateClaudeKey,
    updateProxyRequests,
    updateSocks5,
    isBackendEnabled,
  } = globalSettings;
  return (
    <>
      <Title>Settings</Title>
      <div className={style.content}>
        <div className={style.block}>
          <Subtitle>Backend settings</Subtitle>
          <BackendSettings />
        </div>

        <div className={style.block}>
          <Subtitle>Connection settings</Subtitle>
          <InputForm secured label="OpenAI key" value={openaiKey} onChange={updateOpenaiKey} />
          <InputForm secured label="Gemini key" value={geminiKey} onChange={updateGeminiKey} />
          <InputForm secured label="Claude key" value={claudeKey} onChange={updateClaudeKey} />
          <Checkbox
            disabled={!isBackendEnabled}
            checked={proxyRequestsThroughBackend}
            onChange={(e) => updateProxyRequests(e.currentTarget.checked)}
            label={(
              <>
                Proxy all request through backend
                {!isBackendEnabled && <span className={style.note}>Only available when the backend is active</span>}
              </>
            )}
          />
          <InputForm secured label="HTTP proxy url (leave empty to skip)" value={socks5} onChange={updateSocks5} />
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
