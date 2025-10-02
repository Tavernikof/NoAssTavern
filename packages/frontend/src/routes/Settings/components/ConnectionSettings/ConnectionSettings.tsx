import * as React from "react";
import style from "./ConnectionSettings.module.scss";
import InputForm from "src/routes/Settings/components/InputForm/InputForm.tsx";
import { Checkbox } from "src/components/Form";
import { globalSettings } from "src/store/GlobalSettings.ts";
import { observer } from "mobx-react-lite";

type Props = Record<string, never>;

const ConnectionSettings: React.FC<Props> = () => {
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
    <div className={style.container}>
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
  );
};

export default observer(ConnectionSettings) as typeof ConnectionSettings;
