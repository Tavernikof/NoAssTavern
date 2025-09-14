import * as React from "react";
import { observer } from "mobx-react-lite";
import Button from "src/components/Button/Button.tsx";
import { GlobeLock, Globe, Download } from "lucide-react";
import { openConfigureBackendModal } from "src/routes/Settings/components/ConfigureBackendModal";
import style from "./BackendSettings.module.scss";
import { globalSettings } from "src/store/GlobalSettings.ts";
import { backupManager } from "src/store/BackupManager.ts";
import ImportButton from "src/components/ImportButton";
import { openConfigureInBrowserStorageModal } from "../ConfigureInBrowserStorageModal";

type Props = Record<string, never>;

const BackendSettings: React.FC<Props> = () => {
  const { storageType } = globalSettings;

  return (
    <div>
      <div className={style.connectionType}>
        Storage:
        {!globalSettings.isBackendEnabled && (
          <>
            <GlobeLock className={style.icon} /> in browser
            <Button iconBefore={Globe} onClick={() => openConfigureBackendModal({})}>Configure backend storage</Button>
          </>
        )}
        {globalSettings.isBackendEnabled && (
          <>
            <Globe className={style.icon} /> backend
            <Button iconBefore={GlobeLock} onClick={() => openConfigureInBrowserStorageModal({})}>Configure in browser storage</Button>
          </>
        )}
      </div>
      <div className={style.backupActions}>
        <Button iconBefore={Download} onClick={() => backupManager.exportAllToFile()}>Export all data to file</Button>
        <ImportButton onUpload={(file) => backupManager.importAllDataFromFile(file)} text="Import all data from file" />
      </div>
    </div>
  );
};

export default observer(BackendSettings) as typeof BackendSettings;
