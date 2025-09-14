import * as React from "react";
import style from "./BackendNotification.module.scss";
import { observer } from "mobx-react-lite";
import { backendManager } from "src/store/BackendManager.ts";
import { globalSettings } from "src/store/GlobalSettings.ts";
import clsx from "clsx";
import Button from "src/components/Button";
import { useNavigate } from "react-router";

type Props = Record<string, never>;

const BackendNotification: React.FC<Props> = () => {
  const { storageType } = globalSettings;
  const { isConnected } = backendManager;
  const navigate = useNavigate();

  if (!globalSettings.isBackendEnabled && isConnected) return (
    <div className={clsx(style.container, style.containerSuccess)}>
      Backend available.
      <div className={style.action}>
        <Button onClick={() => navigate("/settings")}>Open settings</Button>
      </div>
    </div>
  );

  if (globalSettings.isBackendEnabled && !isConnected) return (
    <div className={clsx(style.container, style.containerError)}>
      Can't connect to backend. Check connection settings.
    </div>
  );

  return null;
};

export default observer(BackendNotification) as typeof BackendNotification;
