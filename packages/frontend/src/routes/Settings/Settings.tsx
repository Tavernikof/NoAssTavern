import * as React from "react";
import Title from "src/components/Title";
import Subtitle from "src/components/App/components/Subtitle";
import { observer } from "mobx-react-lite";
import style from "./Settings.module.scss";
import Button from "src/components/Button";
import { PackagePlus } from "lucide-react";
import { openConnectionProxyModal } from "src/components/ConnectionProxyModal";
import { connectionProxiesManager } from "src/store/ConnectionProxiesManager.ts";
import { ConnectionProxy } from "src/store/ConnectionProxy.ts";
import ConnectionProxiesList from "src/routes/Settings/components/ConnectionProxiesList";
import BackendSettings from "src/routes/Settings/components/BackendSettings";
import NotificationSettings from "src/routes/Settings/components/NotificationSettings";
import ConnectionSettings from "src/routes/Settings/components/ConnectionSettings";

type Props = Record<string, never>;

const Settings: React.FC<Props> = () => {
  return (
    <>
      <Title>Settings</Title>
      <div className={style.content}>
        <div className={style.block}>
          <Subtitle>Backend settings</Subtitle>
          <BackendSettings />
        </div>

        <div className={style.block}>
          <Subtitle>Notification settings</Subtitle>
          <NotificationSettings />
        </div>

        <div className={style.block}>
          <Subtitle>Connection settings</Subtitle>
          <ConnectionSettings />
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
