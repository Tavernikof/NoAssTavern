import * as React from "react";
// import style from "./ConfigureInBrowserStorageModal.module.scss";
import Button from "src/components/Button";
import { GlobeLock } from "lucide-react";
import { backupManager } from "src/store/BackupManager.ts";
import ErrorMessage from "src/components/ErrorMessage";
import { getAxiosError } from "src/helpers/getAxiosError.ts";

type Props = Record<string, never>;

const ConfigureInBrowserStorageModal: React.FC<Props> = () => {
  const [error, setError] = React.useState<string | null>(null);
  return (
    <>
      <Button
        iconBefore={GlobeLock}
        onClick={() => {
          setError(null);
          backupManager.enableInBrowserStorage().catch(async e => {
            setError(typeof e === "string" ? e : await getAxiosError(e));
          });
        }}
      >
        Download data from backend and switch to in browser storage
      </Button>
      <div>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </div>
    </>
  );
};

export default React.memo(ConfigureInBrowserStorageModal) as typeof ConfigureInBrowserStorageModal;
